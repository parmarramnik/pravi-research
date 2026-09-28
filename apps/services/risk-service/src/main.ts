import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { risksRouter } from './modules/risks/risks.controller';
import { RisksService } from './modules/risks/risks.service';
import { RabbitMQClient } from './messaging/rabbitmq';
import { EVENT_ROUTING_KEYS, DomainEvent } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('RiskService:Main');
const app = express();
const port = process.env.PORT || 3004;
const risksService = new RisksService();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: any, res: any) => {
  res.json({
    service: 'risk-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/risks', risksRouter);

// Event Handler for incoming RabbitMQ domain events
async function handleDomainEvent(event: DomainEvent) {
  logger.info('Risk Service received event', { eventType: event.eventType, eventId: event.eventId });

  if (event.eventType === EVENT_ROUTING_KEYS.INSPECTION_COMPLETED) {
    const payload = event.payload;
    await risksService.recalculateRisk(payload.assetId, 'inspection.completed', {
      condition: payload.conditionObserved,
      findings: payload.findings,
      assetCode: payload.assetCode,
    });
  } else if (event.eventType === EVENT_ROUTING_KEYS.MAINTENANCE_COMPLETED) {
    const payload = event.payload;
    await risksService.recalculateRisk(payload.assetId, 'maintenance.completed', {
      condition: payload.conditionAfter,
    });
  } else if (event.eventType === EVENT_ROUTING_KEYS.ASSET_CREATED) {
    const payload = event.payload;
    if (payload.asset?.id) {
      await risksService.recalculateRisk(payload.asset.id, 'asset.created', {
        condition: payload.asset.condition,
        criticality: payload.asset.criticality,
        installationDate: payload.asset.installationDate,
        expectedLifeYears: payload.asset.expectedLifeYears,
        assetCode: payload.asset.assetCode,
      });
    }
  } else if (event.eventType === EVENT_ROUTING_KEYS.ASSET_UPDATED) {
    const payload = event.payload;
    if (payload.assetId) {
      await risksService.recalculateRisk(payload.assetId, 'asset.updated', {
        condition: payload.newCondition,
      });
    }
  }
}

async function bootstrap() {
  try {
    const rabbit = RabbitMQClient.getInstance();
    await rabbit.connect(handleDomainEvent);

    app.listen(port, () => {
      logger.info(`Risk Service listening on port ${port}`);
    });
  } catch (error: any) {
    logger.error('Failed to bootstrap Risk Service', { error: error.message });
  }
}

bootstrap();
