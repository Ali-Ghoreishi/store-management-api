import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  RabbitMQConfig,
  RabbitMQMessage,
} from './interfaces/rabbitmq.interface';
import { getRabbitMQConfig } from 'src/config/rabbitmq.config';
import { getErrorData } from 'src/common/helpers/error.helper';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout;
  private readonly config: RabbitMQConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getRabbitMQConfig(configService);
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect(): Promise<void> {
    try {
      this.logger.log(`Connecting to RabbitMQ: ${this.config.urls.join(', ')}`);

      this.connection = await amqp.connect(this.config.urls[0]);
      this.channel = await this.connection.createChannel();

      // Setup queue
      await this.channel.assertQueue(
        this.config.queue,
        this.config.queueOptions,
      );
      await this.channel.prefetch(this.config.prefetchCount);

      // Handle connection events
      this.connection.on('error', (error) => {
        this.logger.error(`Connection error: ${error.message}`);
        this.handleDisconnect();
      });

      this.connection.on('close', () => {
        this.logger.warn('Connection closed');
        this.handleDisconnect();
      });

      this.isConnected = true;
      this.logger.log(
        `RabbitMQ connected successfully, queue: ${this.config.queue}`,
      );
    } catch (error) {
      this.logger.error(`Failed to connect: ${error.message}`);
      this.handleDisconnect();
    }
  }

  private handleDisconnect(): void {
    this.isConnected = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectTimer = setTimeout(() => {
      this.logger.log(`Attempting to reconnect...`);
      this.connect();
    }, this.config.reconnectTimeInSeconds * 1000);
  }

  // Send message to specific queue
  async sendToQueue(
    queue: string,
    message: RabbitMQMessage,
    options?: amqp.Options.Publish,
  ) {
    if (!this.isConnected || !this.channel) {
      this.logger.error('RabbitMQ not connected');
      return false;
    }

    try {
      const content = Buffer.from(JSON.stringify(message));
      const result = this.channel.sendToQueue(queue, content, {
        persistent: true,
        timestamp: Date.now(),
        ...options,
      });

      this.logger.debug(`Message sent to queue: ${queue}`);
      return result;
    } catch (err) {
      const { message, status } = getErrorData(err);
      this.logger.error(`Failed to send message: ${message}`);
      return false;
    }
  }

  // Send message to default queue
  async send(message: RabbitMQMessage): Promise<boolean> {
    return this.sendToQueue(this.config.queue, message);
  }

  // Publish to exchange (if needed)
  async publish(
    exchange: string,
    routingKey: string,
    message: RabbitMQMessage,
  ): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      this.logger.error('RabbitMQ not connected');
      return false;
    }

    try {
      const content = Buffer.from(JSON.stringify(message));
      const result = this.channel.publish(exchange, routingKey, content, {
        persistent: true,
        timestamp: Date.now(),
      });

      this.logger.debug(`Message published to ${exchange}:${routingKey}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to publish: ${error.message}`);
      throw error;
    }
  }

  // Consume messages from specific queue
  async consume(
    queue: string,
    handler: (
      message: RabbitMQMessage,
      ack: () => void,
      nack: (requeue?: boolean) => void,
    ) => Promise<void>,
  ): Promise<void> {
    if (!this.isConnected || !this.channel) {
      this.logger.error('RabbitMQ not connected');
      return;
    }

    // Ensure queue exists
    await this.channel.assertQueue(queue, this.config.queueOptions);

    await this.channel.consume(queue, async (message) => {
      if (!message) {
        return;
      }

      try {
        const content = JSON.parse(message.content.toString());
        this.logger.debug(`Message received from ${queue}`);

        // Create ack and nack functions
        const ack = () => this.channel.ack(message);
        const nack = (requeue = false) =>
          this.channel.nack(message, false, requeue);

        await handler(content, ack, nack);
      } catch (error) {
        this.logger.error(`Error processing message: ${error.message}`);
        this.channel.nack(message, false, false); // Don't requeue failed messages
      }
    });

    this.logger.log(`Started consuming from queue: ${queue}`);
  }

  // Consume from default queue
  async consumeDefault(
    handler: (
      message: RabbitMQMessage,
      ack: () => void,
      nack: (requeue?: boolean) => void,
    ) => Promise<void>,
  ): Promise<void> {
    return this.consume(this.config.queue, handler);
  }

  // Get single message
  async getMessage(queue?: string): Promise<any | null> {
    const targetQueue = queue || this.config.queue;

    if (!this.isConnected || !this.channel) {
      return null;
    }

    const message = await this.channel.get(targetQueue, { noAck: false });

    if (message) {
      const content = JSON.parse(message.content.toString());
      return {
        content,
        ack: () => this.channel.ack(message),
        nack: (requeue = false) => this.channel.nack(message, false, requeue),
      };
    }

    return null;
  }

  // Check connection status
  isConnectedToRabbitMQ(): boolean {
    return this.isConnected;
  }

  async onModuleDestroy() {
    this.logger.log('Closing RabbitMQ connections...');
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.logger.log('RabbitMQ connections closed');
  }
}
