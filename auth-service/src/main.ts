import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AllRpcExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const tempApp = await NestFactory.createApplicationContext(AppModule); // TBC  // Nest boots twice
  const configService = tempApp.get(ConfigService);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: configService.get<string[]>('rabbitmq.urls'),
        queue: configService.get<string>('rabbitmq.queue'),
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
}
bootstrap();
