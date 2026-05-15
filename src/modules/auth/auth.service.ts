import { HttpException, Injectable } from '@nestjs/common';

import { RegisterAdminDto, RegisterCustomerDto } from './dto/register-auth.dto';
import { LoginAdminDto, LoginCustomerDto } from './dto/login-auth.dto';
import { AdminsService } from 'src/modules/admins/admins.service';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { JwtAuthService } from 'src/common/services/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly bcryptService: BcryptService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const newAdmin = await this.adminsService.create(registerAdminDto);
    return newAdmin;
  }

  async loginAdmin(loginAdminDto: LoginAdminDto) {
    try {
      const admin = await this.adminsService.findOneForAuth({
        email: loginAdminDto.email,
      });
      if (!admin)
        throw new HttpException(
          'Incorrect username or password. Please try again.',
          401,
        );
      if (
        !(await this.bcryptService.compare(
          loginAdminDto.password,
          admin.password,
        ))
      ) {
        throw new HttpException(
          'Incorrect username or password. Please try again.',
          401,
        );
      }
      if (admin.deleted) {
        throw new HttpException('Account has been deactivated', 401);
      }
      const tokens = this.jwtAuthService.generateUserToken(admin);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userData: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        },
      };
    } catch (err) {
      throw new HttpException(
        err.message,
        err instanceof HttpException ? err.getStatus() : err.status || 500,
      );
    }
  }

  // customerRegister(registerCustomerDto: RegisterCustomerDto) {
  //   return 'This action adds a new customer';
  // }

  login() {
    return `login successful`;
  }
}
