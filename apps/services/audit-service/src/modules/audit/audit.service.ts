import { prisma } from '../../database/prisma';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('AuditService:Engine');

export class AuditService {
  async findAll(query: {
    entity?: string;
    entityId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entity) where.entity = query.entity;
    if (query.entityId) where.entityId = query.entityId;
    if (query.action) where.action = query.action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    return {
      logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEntity(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async record(data: {
    action: string;
    entity: string;
    entityId: string;
    actorId?: string;
    actorName?: string;
    service: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
  }) {
    logger.info('Recording audit log entry', { action: data.action, entity: data.entity, entityId: data.entityId });
    return prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        actorId: data.actorId,
        actorName: data.actorName || 'System',
        service: data.service,
        oldValues: data.oldValues ? (typeof data.oldValues === 'string' ? data.oldValues : JSON.stringify(data.oldValues)) : null,
        newValues: data.newValues ? (typeof data.newValues === 'string' ? data.newValues : JSON.stringify(data.newValues)) : null,
        ipAddress: data.ipAddress,
      },
    });
  }
}
