import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RabbitMQService } from './rabbitmq.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: configService.get<string[]>('rabbitmq.urls'),
            queue: 'email_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },

      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: configService.get<string[]>('rabbitmq.urls'),
            queue: 'user_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],

  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
