import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auditRouter } from './modules/audit/audit.controller';
import { AuditService } from './modules/audit/audit.service';
import { RabbitMQClient } from './messaging/rabbitmq';
import { DomainEvent } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('AuditService:Main');
const app = express();
const port = process.env.PORT || 3007;
const auditService = new AuditService();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: any, res: any) => {
  res.json({
    service: 'audit-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/audit', auditRouter);

async function handleDomainEvent(event: DomainEvent) {
  logger.info('Audit Service captured event', { eventType: event.eventType, eventId: event.eventId });

  let entity = 'System';
  let entityId = event.eventId;

  if (event.eventType.startsWith('asset.')) {
    entity = 'Asset';
    entityId = event.payload.assetId || event.payload.asset?.id || event.payload.assetCode || entityId;
  } else if (event.eventType.startsWith('inspection.')) {
    entity = 'Inspection';
    entityId = event.payload.inspectionId || entityId;
  } else if (event.eventType.startsWith('workorder.') || event.eventType.startsWith('maintenance.')) {
    entity = 'WorkOrder';
    entityId = event.payload.workOrderId || event.payload.maintenanceId || entityId;
  } else if (event.eventType.startsWith('risk.')) {
    entity = 'RiskScore';
    entityId = event.payload.assetRisk?.assetId || entityId;
  }

  await auditService.record({
    action: event.eventType,
    entity,
    entityId,
    actorName: event.source,
    service: event.source,
    newValues: event.payload,
  });
}

async function bootstrap() {
  try {
    const rabbit = RabbitMQClient.getInstance();
    await rabbit.connect(handleDomainEvent);

    app.listen(port, () => {
      logger.info(`Audit Service listening on port ${port}`);
    });
  } catch (error: any) {
    logger.error('Failed to bootstrap Audit Service', { error: error.message });
  }
}

bootstrap();
