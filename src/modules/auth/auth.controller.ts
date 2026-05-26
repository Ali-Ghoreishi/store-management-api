import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
} from '@nestjs/common';

import Res from '../../common/helpers/response.helper';
import { getErrorData } from 'src/common/helpers/error.helper';
import { AuthService } from './auth.service';
import { RegisterAdminDto, RegisterCustomerDto } from './dto/register-auth.dto';
import { LoginAdminDto, LoginCustomerDto } from './dto/login-auth.dto';

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
}
