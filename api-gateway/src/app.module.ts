import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RmqModule } from './common/modules/rabbitmq/rabbitmq.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    RmqModule.register('AUTH_CLIENT', 'RABBITMQ_AUTH_QUEUE'),
    RmqModule.register('USER_CLIENT', 'RABBITMQ_USER_QUEUE'),
    RmqModule.register('CATALOG_CLIENT', 'RABBITMQ_CATALOG_QUEUE'),
    RmqModule.register('ORDER_CLIENT', 'RABBITMQ_ORDER_QUEUE'),
  ],
  controllers: [AuthController],
})
export class AppModule {}
