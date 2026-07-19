import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { RabbitMQService } from 'src/common/modules/rabbitmq/rabbitmq.service';
import { CustomersService } from './customers.service';
import { RabbitMQEvents } from 'src/common/modules/rabbitmq/constants/events';

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
      console.log('USER_CREATED event received:');
      await this.customerService.registerSelf(data);
      this.rabbitMQService.ack(context);
    } catch (error) {
      this.rabbitMQService.nack(context);
      throw error;
    }
  }
}
