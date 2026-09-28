import { prisma } from '../../database/prisma';
import { RabbitMQClient } from '../../messaging/rabbitmq';
import { EVENT_ROUTING_KEYS } from '@infrasphere/shared-events';
import { calculateInspectionScore, conditionToScore } from '@infrasphere/shared-utils';
import { FindingSeverity, AssetCondition } from '@infrasphere/shared-types';

export class InspectionsService {
  private rabbit = RabbitMQClient.getInstance();

  async findAll(query: {
    assetId?: string;
    status?: string;
    inspectorName?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.assetId) where.assetId = query.assetId;
    if (query.status) where.status = query.status;
    if (query.inspectorName) where.inspectorName = { contains: query.inspectorName, mode: 'insensitive' };

    const [total, inspections] = await Promise.all([
      prisma.inspection.count({ where }),
      prisma.inspection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          findings: true,
          documents: true,
        },
      }),
    ]);

    return {
      inspections,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.inspection.findUnique({
      where: { id },
      include: {
        findings: true,
        documents: true,
      },
    });
  }

  async findByAssetId(assetId: string) {
    return prisma.inspection.findMany({
      where: { assetId },
      orderBy: { scheduledDate: 'desc' },
      include: {
        findings: true,
      },
    });
  }

  async create(data: {
    assetId: string;
    assetCode?: string;
    inspectorName: string;
    scheduledDate: string;
    conditionObserved?: string;
    summary?: string;
    findings?: any[];
  }) {
    const count = await prisma.inspection.count();
    const inspectionCode = `INSP-${String(count + 1).padStart(6, '0')}`;

    const inspection = await prisma.inspection.create({
      data: {
        inspectionCode,
        assetId: data.assetId,
        assetCode: data.assetCode,
        inspectorName: data.inspectorName,
        scheduledDate: new Date(data.scheduledDate),
        status: 'SCHEDULED',
        conditionObserved: data.conditionObserved || 'GOOD',
        summary: data.summary,
        findings: data.findings?.length
          ? {
              create: data.findings.map((f: any) => ({
                title: f.title,
                description: f.description,
                severity: f.severity,
                category: f.category,
                recommendedAction: f.recommendedAction,
              })),
            }
          : undefined,
      },
      include: {
        findings: true,
      },
    });

    await this.rabbit.publish(EVENT_ROUTING_KEYS.INSPECTION_CREATED, {
      inspectionId: inspection.id,
      assetId: inspection.assetId,
      scheduledDate: inspection.scheduledDate.toISOString(),
    });

    return inspection;
  }

  async addFinding(inspectionId: string, data: {
    title: string;
    description: string;
    severity: string;
    category?: string;
    recommendedAction?: string;
  }) {
    return prisma.inspectionFinding.create({
      data: {
        inspectionId,
        title: data.title,
        description: data.description,
        severity: data.severity,
        category: data.category,
        recommendedAction: data.recommendedAction,
      },
    });
  }

  /**
   * Complete an inspection:
   * Sets status to COMPLETED, records observed condition,
   * calculates score based on severity of findings, and
   * publishes `inspection.completed` to trigger Risk recalculation!
   */
  async completeInspection(
    id: string,
    data: {
      conditionObserved: string;
      summary?: string;
      nextInspectionDate?: string;
      findings?: any[];
    }
  ) {
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: { findings: true },
    });

    if (!inspection) return null;

    // Add any newly provided findings
    if (data.findings && data.findings.length > 0) {
      await prisma.inspectionFinding.createMany({
        data: data.findings.map((f: any) => ({
          inspectionId: id,
          title: f.title,
          description: f.description,
          severity: f.severity,
          category: f.category,
          recommendedAction: f.recommendedAction,
        })),
      });
    }

    const allFindings = await prisma.inspectionFinding.findMany({
      where: { inspectionId: id },
    });

    // Calculate overall inspection score
    const findingsScore = calculateInspectionScore(
      allFindings.map((f: any) => ({ severity: f.severity as FindingSeverity }))
    );
    const conditionScore = conditionToScore(data.conditionObserved as AssetCondition);
    const overallScore = Math.round(0.6 * conditionScore + 0.4 * findingsScore);

    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        conditionObserved: data.conditionObserved,
        summary: data.summary || inspection.summary,
        overallScore,
        nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : undefined,
      },
      include: {
        findings: true,
      },
    });

    // Counts for event
    const criticalFindings = allFindings.filter((f: any) => f.severity === 'CRITICAL');
    const highFindings = allFindings.filter((f: any) => f.severity === 'HIGH');

    // Publish RabbitMQ domain event
    await this.rabbit.publish(EVENT_ROUTING_KEYS.INSPECTION_COMPLETED, {
      inspectionId: updated.id,
      assetId: updated.assetId,
      assetCode: updated.assetCode,
      conditionObserved: updated.conditionObserved,
      overallScore: updated.overallScore,
      criticalFindingsCount: criticalFindings.length,
      highFindingsCount: highFindings.length,
      findings: allFindings,
      completedDate: updated.completedDate?.toISOString(),
    });

    return updated;
  }
}
