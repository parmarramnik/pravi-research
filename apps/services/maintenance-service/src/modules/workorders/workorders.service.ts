import { prisma } from '../../database/prisma';
import { RabbitMQClient } from '../../messaging/rabbitmq';
import { EVENT_ROUTING_KEYS } from '@infrasphere/shared-events';

export class WorkOrdersService {
  private rabbit = RabbitMQClient.getInstance();

  async findAll(query: {
    assetId?: string;
    status?: string;
    priority?: string;
    assignedTechnician?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.assetId) where.assetId = query.assetId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTechnician) {
      where.assignedTechnician = { contains: query.assignedTechnician, mode: 'insensitive' };
    }

    const [total, workOrders] = await Promise.all([
      prisma.workOrder.count({ where }),
      prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          maintenanceRecords: true,
        },
      }),
    ]);

    return {
      workOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.workOrder.findUnique({
      where: { id },
      include: {
        maintenanceRecords: true,
      },
    });
  }

  async findByAssetId(assetId: string) {
    return prisma.workOrder.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
      include: {
        maintenanceRecords: true,
      },
    });
  }

  async create(data: {
    assetId: string;
    assetCode?: string;
    title: string;
    description: string;
    maintenanceType: string;
    priority: string;
    assignedTechnician?: string;
    assignedDepartment?: string;
    scheduledStartDate?: string;
    scheduledEndDate?: string;
    estimatedCost?: number;
  }) {
    const count = await prisma.workOrder.count();
    const orderNumber = `WO-${String(count + 1).padStart(6, '0')}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        orderNumber,
        assetId: data.assetId,
        assetCode: data.assetCode,
        title: data.title,
        description: data.description,
        maintenanceType: data.maintenanceType,
        priority: data.priority,
        status: data.assignedTechnician ? 'ASSIGNED' : 'OPEN',
        assignedTechnician: data.assignedTechnician,
        assignedDepartment: data.assignedDepartment,
        scheduledStartDate: data.scheduledStartDate ? new Date(data.scheduledStartDate) : undefined,
        scheduledEndDate: data.scheduledEndDate ? new Date(data.scheduledEndDate) : undefined,
        estimatedCost: data.estimatedCost || 0,
      },
    });

    await this.rabbit.publish(EVENT_ROUTING_KEYS.WORKORDER_CREATED, {
      workOrder,
    });

    return workOrder;
  }

  async update(id: string, data: any) {
    return prisma.workOrder.update({
      where: { id },
      data,
    });
  }

  /**
   * Complete Work Order:
   * Sets status to COMPLETED, creates MaintenanceRecord,
   * and publishes `workorder.completed` & `maintenance.completed` to trigger Risk recalculation!
   */
  async completeWorkOrder(
    id: string,
    data: {
      actualCost: number;
      resolutionNotes: string;
      conditionAfter?: string; // e.g. "GOOD" or "EXCELLENT"
      performedBy?: string;
      partsReplaced?: string[];
    }
  ) {
    const workOrder = await prisma.workOrder.findUnique({ where: { id } });
    if (!workOrder) return null;

    const conditionAfter = data.conditionAfter || 'GOOD';
    const cost = Number(data.actualCost) || workOrder.estimatedCost || 0;
    const performedBy = data.performedBy || workOrder.assignedTechnician || 'Senior Maintenance Engineer';

    const result = await prisma.$transaction(async (tx) => {
      const updatedWO = await tx.workOrder.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualEndDate: new Date(),
          actualCost: cost,
          resolutionNotes: data.resolutionNotes,
          partsReplaced: data.partsReplaced ? JSON.stringify(data.partsReplaced) : undefined,
        },
      });

      const maintenanceRecord = await tx.maintenanceRecord.create({
        data: {
          assetId: workOrder.assetId,
          workOrderId: workOrder.id,
          maintenanceType: workOrder.maintenanceType,
          description: `Work Order ${workOrder.orderNumber}: ${workOrder.title}. ${data.resolutionNotes}`,
          performedBy,
          completionDate: new Date(),
          cost,
          conditionAfter,
          notes: data.resolutionNotes,
        },
      });

      return { updatedWO, maintenanceRecord };
    });

    // Publish RabbitMQ domain events
    await this.rabbit.publish(EVENT_ROUTING_KEYS.WORKORDER_COMPLETED, {
      workOrderId: id,
      assetId: workOrder.assetId,
      actualCost: cost,
      completedAt: new Date().toISOString(),
    });

    await this.rabbit.publish(EVENT_ROUTING_KEYS.MAINTENANCE_COMPLETED, {
      record: result.maintenanceRecord,
      assetId: workOrder.assetId,
      conditionAfter,
      cost,
    });

    return result;
  }

  async getMaintenanceHistory(assetId: string) {
    return prisma.maintenanceRecord.findMany({
      where: { assetId },
      orderBy: { completionDate: 'desc' },
      include: {
        workOrder: true,
      },
    });
  }

  async getDashboardStats() {
    const [openCount, inProgressCount, completedCount, totalCost] = await Promise.all([
      prisma.workOrder.count({ where: { status: { in: ['OPEN', 'ASSIGNED'] } } }),
      prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.workOrder.aggregate({
        _sum: { actualCost: true },
      }),
    ]);

    return {
      openWorkOrders: openCount + inProgressCount,
      completedWorkOrders: completedCount,
      totalMaintenanceSpend: totalCost._sum.actualCost || 0,
    };
  }
}
