import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { inspectionsRouter } from './modules/inspections/inspections.controller';
import { RabbitMQClient } from './messaging/rabbitmq';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('InspectionService:Main');
const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    service: 'inspection-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Inspection routes
app.use('/api/inspections', inspectionsRouter);

async function bootstrap() {
  try {
    const rabbit = RabbitMQClient.getInstance();
    await rabbit.connect();

    app.listen(port, () => {
      logger.info(`Inspection Service listening on port ${port}`);
    });
  } catch (error: any) {
    logger.error('Failed to bootstrap Inspection Service', { error: error.message });
  }
}

bootstrap();
