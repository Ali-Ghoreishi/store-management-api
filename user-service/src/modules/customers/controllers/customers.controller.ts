import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomersService } from '../customers.service';
import {
  CreateCustomerDto,
  AdminCreateCustomerDto,
} from '../dto/create-customer.dto';
import {
  UpdateCustomerDto,
  AdminUpdateCustomerDto,
} from '../dto/update-customer.dto';
import { UpdateQuery } from 'mongoose';
import { Customer } from '../schemas/customer.schema';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // @Post()
  // create(@Body() createCustomerDto: CreateCustomerDto) {
  //   return this.customersService.create(createCustomerDto);
  // }

  // @Get()
  // findAll() {
  //   return this.customersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.customersService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateOne(
      { _id: +id },
      { $set: updateCustomerDto },
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.customersService.remove(+id);
  // }
}
