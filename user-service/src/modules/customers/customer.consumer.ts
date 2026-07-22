import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { RabbitMQService } from 'src/common/modules/rabbitmq/rabbitmq.service';
import { CustomersService } from './customers.service';
import { RabbitMQEvents } from 'src/common/modules/rabbitmq/constants/events';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import type { UserUpdatedEvent } from 'src/common/types/user-updated-event.interface';

@Controller()
export class CustomerConsumer {
  constructor(
    private readonly customerService: CustomersService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @EventPattern(RabbitMQEvents.USER_CREATED)
  async createCustomer(
    @Payload() data: CreateCustomerDto,
    @Ctx() context: RmqContext,
  ) {
    try {
      // console.log('USER_CREATED event received:');
      await this.customerService.registerSelf(data);
      this.rabbitMQService.ack(context);
    } catch (error) {
      this.rabbitMQService.nack(context);
      throw error;
    }
  }

  @EventPattern(RabbitMQEvents.USER_UPDATED)
  async updateCustomer(
    @Payload() data: UserUpdatedEvent,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.customerService.updateOne(
        { email: data.doc.email },
        data.updateObj,
      );
      this.rabbitMQService.ack(context);
    } catch (error) {
      this.rabbitMQService.nack(context);
      throw error;
    }
  }
}
