import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  ack(context: RmqContext): void {
    context.getChannelRef().ack(context.getMessage());
  }

  nack(context: RmqContext, requeue = false): void {
    context.getChannelRef().nack(context.getMessage(), false, requeue);
  }
}
