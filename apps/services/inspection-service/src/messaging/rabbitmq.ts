import amqp, { Channel, Connection } from 'amqplib';
import { RABBITMQ_EXCHANGE, DomainEvent, createDomainEvent } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('InspectionService:RabbitMQ');

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  public async connect(): Promise<void> {
    if (this.channel || this.isConnecting) return;
    this.isConnecting = true;

    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';
    const user = process.env.RABBITMQ_USER || 'infrasphere';
    const password = process.env.RABBITMQ_PASSWORD || 'infrasphere_secret';
    const url = `amqp://${user}:${password}@${host}:${port}`;

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', { durable: true });
      logger.info('Inspection Service connected to RabbitMQ', { exchange: RABBITMQ_EXCHANGE });

      this.connection.on('error', (err: any) => {
        logger.error('RabbitMQ connection error', { error: err.message });
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed, reconnecting in 5s');
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(), 5000);
      });

      this.isConnecting = false;
    } catch (err: any) {
      this.isConnecting = false;
      logger.warn('RabbitMQ connection failed (will retry in 5s)', { error: err.message });
      setTimeout(() => this.connect(), 5000);
    }
  }

  public async publish(routingKey: string, payload: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        logger.warn('RabbitMQ channel not ready, skipping event', { routingKey });
        return false;
      }

      const event: DomainEvent = createDomainEvent(routingKey, 'inspection-service', payload);
      const buffer = Buffer.from(JSON.stringify(event));
      this.channel.publish(RABBITMQ_EXCHANGE, routingKey, buffer, { persistent: true });
      logger.info('Published inspection event', { routingKey, eventId: event.eventId });
      return true;
    } catch (err: any) {
      logger.error('Failed to publish inspection event', { error: err.message, routingKey });
      return false;
    }
  }
}
