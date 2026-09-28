import amqp, { Channel, Connection } from 'amqplib';
import { RABBITMQ_EXCHANGE, DomainEvent, EVENT_ROUTING_KEYS } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('NotificationService:RabbitMQ');

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

      const q = await this.channel.assertQueue('notification-service.queue', { durable: true });

      const routingKeys = [
        EVENT_ROUTING_KEYS.RISK_UPDATED,
        EVENT_ROUTING_KEYS.INSPECTION_COMPLETED,
        EVENT_ROUTING_KEYS.WORKORDER_COMPLETED,
        EVENT_ROUTING_KEYS.MAINTENANCE_COMPLETED,
      ];

      for (const rk of routingKeys) {
        await this.channel.bindQueue(q.queue, RABBITMQ_EXCHANGE, rk);
      }

      logger.info('Notification Service connected & bound to RabbitMQ events', { queue: q.queue });

      if (onEventCallback) {
        this.channel.consume(q.queue, async (msg: any) => {
          if (!msg) return;
          try {
            const content = JSON.parse(msg.content.toString()) as DomainEvent;
            
            // Idempotency check
            if (content.eventId && this.processedEvents.has(content.eventId)) {
              this.channel?.ack(msg);
              return;
            }

            if (content.eventId) {
              this.processedEvents.add(content.eventId);
              if (this.processedEvents.size > 1000) {
                const first = this.processedEvents.values().next().value;
                if (first) this.processedEvents.delete(first);
              }
            }

            await onEventCallback(content);
            this.channel?.ack(msg);
          } catch (err: any) {
            logger.error('Error in Notification consumer', { error: err.message });
            this.channel?.nack(msg, false, false);
          }
        });
      }

      this.connection.on('error', () => {
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(onEventCallback), 5000);
      });

      this.connection.on('close', () => {
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(onEventCallback), 5000);
      });

      this.isConnecting = false;
    } catch (err: any) {
      this.isConnecting = false;
      setTimeout(() => this.connect(onEventCallback), 5000);
    }
  }
}
