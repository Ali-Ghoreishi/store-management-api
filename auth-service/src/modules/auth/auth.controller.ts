import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-auth.dto';
import { RegisterCustomerDto } from './dto/register-auth.dto';
import { RabbitMQService } from 'src/common/modules/rabbitmq/rabbitmq.service';
import { VerifyAccountDto } from './dto/verify-account-auth.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @MessagePattern({ cmd: 'login_admin' })
  async loginAdmin(
    @Payload() loginUserDto: LoginUserDto,
    @Ctx() context: RmqContext,
  ) {
    this.rabbitMQService.ack(context);
    return await this.authService.loginAdmin(loginUserDto);
  }

  @MessagePattern({ cmd: 'login_customer' })
  async loginCustomer(
    @Payload() loginUserDto: LoginUserDto,
    @Ctx() context: RmqContext,
  ) {
    this.rabbitMQService.ack(context);
    return await this.authService.loginCustomer(loginUserDto);
  }

  @MessagePattern({ cmd: 'register_customer' })
  async registerCustomer(
    @Payload() registerCustomerDto: RegisterCustomerDto,
    @Ctx() context: RmqContext,
  ) {
    this.rabbitMQService.ack(context);
    return await this.authService.registerCustomer(registerCustomerDto);
  }

  @MessagePattern({ cmd: 'verify_account' })
  async verifyAccount(
    @Payload() verifyAccountDto: VerifyAccountDto,
    @Ctx() context: RmqContext,
  ) {
    this.rabbitMQService.ack(context);
    return await this.authService.verifyAccount(verifyAccountDto);
  }
}
