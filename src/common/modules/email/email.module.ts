import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailConsumer } from './email.consumer';
import { RabbitMQModule } from '../../modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [EmailService, EmailConsumer],
  exports: [EmailService],
})
export class EmailModule {}
