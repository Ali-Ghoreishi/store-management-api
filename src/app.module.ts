import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [CustomersModule],
})
export class AppModule {}
