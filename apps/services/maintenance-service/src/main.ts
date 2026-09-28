import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { maintenanceRouter } from './modules/workorders/workorders.controller';
import { RabbitMQClient } from './messaging/rabbitmq';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('MaintenanceService:Main');
const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    service: 'maintenance-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Maintenance API routes
app.use('/api', maintenanceRouter);

async function bootstrap() {
  try {
    const rabbit = RabbitMQClient.getInstance();
    await rabbit.connect();

    app.listen(port, () => {
      logger.info(`Maintenance Service listening on port ${port}`);
    });
  } catch (error: any) {
    logger.error('Failed to bootstrap Maintenance Service', { error: error.message });
  }
}

bootstrap();
