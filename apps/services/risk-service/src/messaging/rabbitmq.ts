import amqp, { Channel, Connection } from 'amqplib';
import { RABBITMQ_EXCHANGE, DomainEvent, createDomainEvent, EVENT_ROUTING_KEYS } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('RiskService:RabbitMQ');

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;
  private processedEvents = new Set<string>();

  private constructor() {}

  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  public async connect(onEventCallback?: (event: DomainEvent) => Promise<void>): Promise<void> {
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

      // Assert queue for risk service
      const q = await this.channel.assertQueue('risk-service.queue', {
        durable: true,
      });

      // Bind to relevant events
      const routingKeys = [
        EVENT_ROUTING_KEYS.INSPECTION_COMPLETED,
        EVENT_ROUTING_KEYS.MAINTENANCE_COMPLETED,
        EVENT_ROUTING_KEYS.ASSET_CREATED,
        EVENT_ROUTING_KEYS.ASSET_UPDATED,
      ];

      for (const rk of routingKeys) {
        await this.channel.bindQueue(q.queue, RABBITMQ_EXCHANGE, rk);
      }

      logger.info('Risk Service bound to RabbitMQ events', { queue: q.queue, routingKeys });

      // Start consuming
      if (onEventCallback) {
        this.channel.consume(q.queue, async (msg: any) => {
          if (!msg) return;
          try {
            const content = JSON.parse(msg.content.toString()) as DomainEvent;
            
            // Event idempotency check
            if (content.eventId && this.processedEvents.has(content.eventId)) {
              logger.info('Skipping already processed event (idempotency)', { eventId: content.eventId });
              this.channel?.ack(msg);
              return;
            }

            if (content.eventId) {
              this.processedEvents.add(content.eventId);
              // limit cache size to 1000
              if (this.processedEvents.size > 1000) {
                const first = this.processedEvents.values().next().value;
                if (first) this.processedEvents.delete(first);
              }
            }

            await onEventCallback(content);
            this.channel?.ack(msg);
          } catch (err: any) {
            logger.error('Error processing event in Risk Service', { error: err.message });
            // Negative acknowledge and requeue once or dead-letter
            this.channel?.nack(msg, false, false);
          }
        });
      }

      this.connection.on('error', (err: any) => {
        logger.error('RabbitMQ error in Risk Service', { error: err.message });
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(onEventCallback), 5000);
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed in Risk Service, reconnecting');
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(onEventCallback), 5000);
      });

      this.isConnecting = false;
    } catch (err: any) {
      this.isConnecting = false;
      logger.warn('RabbitMQ connection failed in Risk Service (will retry)', { error: err.message });
      setTimeout(() => this.connect(onEventCallback), 5000);
    }
  }

  public async publish(routingKey: string, payload: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) return false;

      const event: DomainEvent = createDomainEvent(routingKey, 'risk-service', payload);
      const buffer = Buffer.from(JSON.stringify(event));
      this.channel.publish(RABBITMQ_EXCHANGE, routingKey, buffer, { persistent: true });
      logger.info('Risk Service published event', { routingKey, eventId: event.eventId });
      return true;
    } catch (err: any) {
      logger.error('Failed to publish risk event', { error: err.message, routingKey });
      return false;
    }
  }
}
