// import { ConfigService } from '@nestjs/config';
// import { RabbitMQConfig } from 'src/common/modules/rabbitmq/interfaces/rabbitmq.interface';

// export const getRabbitMQConfig = (
//   configService: ConfigService,
//   queueName?: string,
// ): RabbitMQConfig => ({
//   urls: configService.get<string[]>('rabbitmq.urls') || [
//     'amqp://localhost:5672',
//   ],
//   queue:
//     queueName || configService.get<string>('rabbitmq.queue') || 'auth_queue',
//   queueOptions: configService.get('rabbitmq.queueOptions') || {
//     durable: false,
//   },
//   prefetchCount: configService.get<number>('rabbitmq.prefetchCount') || 10,
//   reconnectTimeInSeconds:
//     configService.get<number>('rabbitmq.reconnectTimeInSeconds') || 5,
// });

// // Helper to get queue-specific config
// export const getQueueConfig = (
//   configService: ConfigService,
//   queueName: string,
// ) => {
//   return getRabbitMQConfig(configService, queueName);
// };
