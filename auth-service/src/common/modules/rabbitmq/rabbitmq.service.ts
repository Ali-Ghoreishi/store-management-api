import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleInit {

  constructor(
    @Inject('EMAIL_SERVICE')
    private readonly emailClient: ClientProxy,

    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  private clients = new Map<string, ClientProxy>();

  onModuleInit() {
    this.clients.set('email', this.emailClient);
    this.clients.set('user', this.userClient);
  }

  ack(context: RmqContext): void {
    context.getChannelRef().ack(context.getMessage());
  }

  nack(context: RmqContext, requeue = false): void {
    context.getChannelRef().nack(context.getMessage(), false, requeue);
  }

  emit(service: string, pattern: string, payload: unknown) {
    const client = this.clients.get(service);

    if (!client) {
      throw new Error(`RabbitMQ client "${service}" not found.`);
    }

    return client.emit(pattern, payload);
  }

  async send(service: string, pattern: string, payload: unknown) {
    const client = this.clients.get(service);

    if (!client) {
      throw new Error(`RabbitMQ client "${service}" not found.`);
    }

    return firstValueFrom(client.send(pattern, payload));
  }
}
