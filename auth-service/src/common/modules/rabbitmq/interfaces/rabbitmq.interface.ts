

export interface RabbitMQConfig {
  urls: string[];
  queue: string;
  queueOptions: {
    durable: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    arguments?: any;
  };
  prefetchCount: number;
  reconnectTimeInSeconds: number;
}

export interface RabbitMQMessage<T = any> {
  event: string;
  data: T;
  correlationId?: string;
  replyTo?: string;
  timestamp?: Date;
}
