import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomersService } from './customers.service';
import { CustomersController } from './controllers/customers.controller';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { RabbitMQModule } from 'src/common/modules/rabbitmq/rabbitmq.module';
import { CustomerConsumer } from './customer.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
    RabbitMQModule,
  ],
  controllers: [CustomersController, CustomerConsumer],
  providers: [CustomersService, BcryptService],
  exports: [CustomersService],
})
export class CustomersModule {}
