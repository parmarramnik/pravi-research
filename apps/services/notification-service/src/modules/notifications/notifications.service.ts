import { prisma } from '../../database/prisma';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('NotificationService:Engine');

export class NotificationsService {
  async findAll(query: { isRead?: string; severity?: string; limit?: number; page?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';
    if (query.severity) where.severity = query.severity;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount() {
    return prisma.notification.count({
      where: { isRead: false },
    });
  }

  async create(data: {
    title: string;
    message: string;
    severity: string; // INFO, WARNING, ALERT, CRITICAL
    category: string;
    assetId?: string;
    assetCode?: string;
  }) {
    logger.info('Creating notification', { title: data.title, severity: data.severity });
    return prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        severity: data.severity,
        category: data.category,
        assetId: data.assetId,
        assetCode: data.assetCode,
      },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead() {
    return prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
}
