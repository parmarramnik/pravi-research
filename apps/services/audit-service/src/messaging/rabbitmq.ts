import amqp, { Channel, Connection } from 'amqplib';
import { RABBITMQ_EXCHANGE, DomainEvent } from '@infrasphere/shared-events';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('AuditService:RabbitMQ');

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

      const q = await this.channel.assertQueue('audit-service.queue', { durable: true });

      // Wildcard bind: Audit service audits every event published on the exchange
      await this.channel.bindQueue(q.queue, RABBITMQ_EXCHANGE, '#');
      logger.info('Audit Service bound to ALL events on exchange', { queue: q.queue });

      if (onEventCallback) {
        this.channel.consume(q.queue, async (msg: any) => {
          if (!msg) return;
          try {
            const content = JSON.parse(msg.content.toString()) as DomainEvent;
            
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
            logger.error('Error logging audit event', { error: err.message });
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
