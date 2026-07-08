import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  ack(context: RmqContext): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    channel.ack(message);
  }

  nack(context: RmqContext, requeue = false): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    channel.nack(message, false, requeue);
  }
}
