import { ClientsModule, Transport } from '@nestjs/microservices';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './modules/customers/customers.module';
import { RabbitMQModule } from './common/modules/rabbitmq/rabbitmq.module';

@Module({
  controllers: [
    /* AppController */
  ],
  providers: [
    /* AppService */
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    // CommonModule,
    DatabaseModule,
    CustomersModule,
    RabbitMQModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // apply the LoggerMiddleware to all routes
    // consumer.apply(LoggerMiddleware).exclude('products').forRoutes('*');
    //consumer.apply(LoggerMiddleware).forRoutes('products');
  }
}
