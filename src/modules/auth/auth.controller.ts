import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpException,
} from '@nestjs/common';

import Res from 'src/common/helpers/response.helper';
import { AuthService } from './auth.service';
import { RegisterAdminDto, RegisterCustomerDto } from './dto/register-auth.dto';
import { LoginAdminDto, LoginCustomerDto } from './dto/login-auth.dto';
import { VerifyAccountDto } from './dto/verify-account-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/admin')
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto) {
    const result = await this.authService.loginAdmin(loginAdminDto);
    if (result) return Res.ok(result.data, result.message);
  }

  @Post('register/customer')
  async registerCustomer(@Body() registerCustomerDto: RegisterCustomerDto) {
    const result = await this.authService.registerCustomer(registerCustomerDto);
    if (result) return Res.created({});
  }

  @Post('login/customer')
  async loginCustomer(@Body() loginCustomerDto: LoginCustomerDto) {
    const result = await this.authService.loginCustomer(loginCustomerDto);
    if (result) return Res.ok(result.data, result.message);
  }

  // GET /verify-account?email=user@example.com&verifyCode=123456
  @Get('verify-account')
  async verifyAccount(@Query() verifyAccountDto: VerifyAccountDto) {
    const result = await this.authService.verifyAccount(verifyAccountDto);
    if (result) return Res.ok(result.data, result.message);
  }
}
