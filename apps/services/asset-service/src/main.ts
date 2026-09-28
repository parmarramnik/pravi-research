import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { assetsRouter } from './modules/assets/assets.controller';
import { RabbitMQClient } from './messaging/rabbitmq';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('AssetService:Main');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    service: 'asset-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Assets API routes
app.use('/api/assets', assetsRouter);

// Initialize RabbitMQ connection and start HTTP server
async function bootstrap() {
  try {
    const rabbit = RabbitMQClient.getInstance();
    await rabbit.connect();

    app.listen(port, () => {
      logger.info(`Asset Service listening on port ${port}`);
    });
  } catch (error: any) {
    logger.error('Failed to bootstrap Asset Service', { error: error.message });
  }
}

bootstrap();
