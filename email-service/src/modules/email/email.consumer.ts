import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RabbitMQEvents } from '../rabbitmq/constants/events';

import { EmailService } from './email.service';
import type {
  VerifyAccountEmailData,
  WelcomeEmailData,
} from './interfaces/email.interface';

@Controller()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly emailService: EmailService,
  ) {}

  @EventPattern(RabbitMQEvents.EMAIL_WELCOME_USER)
  async handleWelcomeEmail(
    @Payload() payload: WelcomeEmailData,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      this.logger.log(`Processing welcome email for ${payload.email}`);

      await this.emailService.sendWelcomeEmail(payload.email, payload.name);
      console.log('--- log_handleWelcomeEmail ---');
      this.rabbitMQService.ack(context);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${payload.email}`,
        error.stack,
      );

      this.rabbitMQService.nack(context);
    }
  }

  @EventPattern(RabbitMQEvents.EMAIL_VERIFY_ACCOUNT)
  async handleVerifyAccountEmail(
    @Payload() payload: VerifyAccountEmailData,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      this.logger.log(`Processing verification email for ${payload.email}`);

      await this.emailService.sendVerificationCodeEmail(
        payload.email,
        payload.name,
        payload.code,
      );

      this.rabbitMQService.ack(context);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${payload.email}`,
        error.stack,
      );

      this.rabbitMQService.nack(context);
    }
  }
}
