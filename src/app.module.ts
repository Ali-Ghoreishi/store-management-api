import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminsModule } from './admins/admins.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [CustomersModule, ProductsModule, AdminsModule],
})
export class AppModule {}
