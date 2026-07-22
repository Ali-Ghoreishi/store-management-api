import { Controller, Post, Get, Body, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_CLIENT') private readonly authClient: ClientProxy,
  ) {}

  @Post('login/admin')
  loginAdmin(@Body() dto: any) {
    return this.authClient.send({ cmd: 'login_admin' }, dto);
  }

  @Post('login/customer')
  loginCustomer(@Body() dto: any) {
    return this.authClient.send({ cmd: 'login_customer' }, dto);
  }

  @Post('register/customer')
  registerCustomer(@Body() dto: any) {
    return this.authClient.send({ cmd: 'register_customer' }, dto);
  }

  @Get('verify-account')
  verify(@Query() dto: any) {
    return this.authClient.send({ cmd: 'verify_account' }, dto);
  }
}
