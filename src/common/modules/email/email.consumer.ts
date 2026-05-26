import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../modules/rabbitmq/rabbitmq.service';
import { EmailService } from './email.service';
import { QUEUES, EVENTS } from '../../modules/rabbitmq/rabbitmq.constants';
import { RabbitMQMessage } from '../rabbitmq/interfaces/rabbitmq.interface';
import { VerifyAccountEmailData, WelcomeEmailData } from './interfaces/email.interface';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.consumeEmailEvents();
  }

  private async consumeEmailEvents() {
    await this.rabbitMQService.consume(
      QUEUES.EMAIL_QUEUE,
      async (message: RabbitMQMessage, ack, nack) => {
        this.logger.log(`Processing email event: ${message.event}`);

        try {
          switch (message.event) {
            case EVENTS.EMAIL_WELCOME_CUSTOMER: {
              const messageData = message.data as WelcomeEmailData;
              await this.emailService.sendWelcomeEmail(
                messageData.email,
                messageData.name,
              );
              break;
            }

            case EVENTS.EMAIL_VERIFY_ACCOUNT: {
              const messageData = message.data as VerifyAccountEmailData;
              await this.emailService.sendVerificationCodeEmail(
                messageData.email,
                messageData.name,
                messageData.code,
              );
              break;
            }

            default:
              this.logger.warn(`Unknown email event: ${message.event}`);
          }

          ack(); // Acknowledge successful processing
        } catch (error: any) {
          this.logger.error(`Failed to process email: ${error.message}`);
          nack(false); // Don't requeue failed emails to avoid infinite loops
        }
      },
    );

    this.logger.log('Email consumer started');
  }
}
