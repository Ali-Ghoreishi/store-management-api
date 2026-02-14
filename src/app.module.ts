import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminsModule } from './modules/admins/admins.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [CustomersModule, ProductsModule, AdminsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // apply the LoggerMiddleware to all routes
    // consumer.apply(LoggerMiddleware).exclude('products').forRoutes('*');
    //consumer.apply(LoggerMiddleware).forRoutes('products');
  }
}
