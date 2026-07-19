import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomersService } from './customers.service';
import { CustomersController } from './controllers/customers.controller';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, BcryptService],
  exports: [CustomersService],
})
export class CustomersModule {}
