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

import Res from '../../common/helpers/response.helper';
import { getErrorData } from 'src/common/helpers/error.helper';
import { AuthService } from './auth.service';
import { RegisterAdminDto, RegisterCustomerDto } from './dto/register-auth.dto';
import { LoginAdminDto, LoginCustomerDto } from './dto/login-auth.dto';
import { VerifyAccountDto } from './dto/verify-account-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/admin')
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    return await this.authService.registerAdmin(registerAdminDto);
  }

  @Post('login/admin')
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto) {
    return await this.authService.loginAdmin(loginAdminDto);
  }

  @Post('register/customer')
  async registerCustomer(@Body() registerCustomerDto: RegisterCustomerDto) {
    return await this.authService.registerCustomer(registerCustomerDto);
  }

  @Post('login/customer')
  async loginCustomer(@Body() loginCustomerDto: LoginCustomerDto) {
    return await this.authService.loginCustomer(loginCustomerDto);
  }

  // GET /verify-account?email=user@example.com&verifyCode=123456
  @Get('verify-account')
  async verifyAccount(@Query() verifyAccountDto: VerifyAccountDto) {
    return await this.authService.verifyAccount(verifyAccountDto);
  }
}
