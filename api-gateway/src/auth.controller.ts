import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_CLIENT') private readonly authClient: ClientProxy,
  ) {}

  @Post('login/admin')
  loginAdmin(@Body() dto: any) {
    // console.log('Gateway -> sending login_admin');
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

  @Post('verify')
  verify(@Body() dto: any) {
    return this.authClient.send({ cmd: 'verify_account' }, dto);
  }
}
