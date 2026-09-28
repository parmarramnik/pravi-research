import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { notificationsRouter } from './modules/notifications/notifications.controller';
import { NotificationsService } from './modules/notifications/notifications.service';
import { RabbitMQClient } from './messaging/rabbitmq';
import { EVENT_ROUTING_KEYS, DomainEvent } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('NotificationService:Main');
const app = express();
const port = process.env.PORT || 3006;
const notificationsService = new NotificationsService();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: any, res: any) => {
  res.json({
    service: 'notification-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/notifications', notificationsRouter);

async function handleDomainEvent(event: DomainEvent) {
  logger.info('Notification Service received domain event', { eventType: event.eventType });

  if (event.eventType === EVENT_ROUTING_KEYS.RISK_UPDATED) {
    const risk = event.payload?.assetRisk;
    if (risk && (risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL')) {
      await notificationsService.create({
        title: `CRITICAL RISK ALERT: Asset ${risk.assetId}`,
        message: `Asset risk score elevated to ${risk.riskScore}/100 (${risk.riskLevel}). Health score is ${risk.healthScore}/100. Maintenance priority: ${risk.maintenancePriority}.`,
        severity: risk.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'ALERT',
        category: 'RISK_ALERT',
        assetId: risk.assetId,
      });
    }
  } else if (event.eventType === EVENT_ROUTING_KEYS.INSPECTION_COMPLETED) {
    const payload = event.payload;
    const isCritical = payload.criticalFindingsCount > 0;
    await notificationsService.create({
      title: `Inspection Completed: ${payload.assetCode || payload.assetId}`,
      message: `Inspection completed with observed condition ${payload.conditionObserved}. ${payload.findings?.length || 0} findings recorded (${payload.criticalFindingsCount} critical).`,
      severity: isCritical ? 'ALERT' : 'INFO',
      category: 'INSPECTION',
      assetId: payload.assetId,
      assetCode: payload.assetCode,
    });
  } else if (event.eventType === EVENT_ROUTING_KEYS.WORKORDER_COMPLETED) {
    const payload = event.payload;
    await notificationsService.create({
      title: `Work Order Completed for Asset ${payload.assetId}`,
      message: `Maintenance repair successfully concluded. Actual cost: ₹${payload.actualCost.toLocaleString('en-IN')}.`,
      severity: 'INFO',
      category: 'MAINTENANCE',
      assetId: payload.assetId,
    });
  }
}

async function bootstrap() {
  try {
    const rabbit = RabbitMQClient.getInstance();
    await rabbit.connect(handleDomainEvent);

    app.listen(port, () => {
      logger.info(`Notification Service listening on port ${port}`);
    });
  } catch (error: any) {
    logger.error('Failed to bootstrap Notification Service', { error: error.message });
  }
}

bootstrap();
