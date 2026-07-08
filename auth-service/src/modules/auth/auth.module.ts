import { ClientsModule, Transport } from '@nestjs/microservices';

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { CommonModule } from 'src/common/modules/jwt/common.module';
// import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RabbitMQModule } from 'src/common/modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [UsersModule, CommonModule, RabbitMQModule],
  controllers: [AuthController],
  providers: [AuthService, BcryptService /* JwtStrategy */],
})
export class AuthModule {}
