import { HttpException, Injectable } from '@nestjs/common';

import Res from '../../common/helpers/response.helper';
import { getErrorData } from 'src/common/helpers/error.helper';
import { RegisterAdminDto, RegisterCustomerDto } from './dto/register-auth.dto';
import { LoginAdminDto, LoginCustomerDto } from './dto/login-auth.dto';
import { AdminsService } from 'src/modules/admins/admins.service';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { JwtAuthService } from 'src/common/services/jwt.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import Helper from '../../utils/helpers';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly bcryptService: BcryptService,
    private readonly jwtAuthService: JwtAuthService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const result = await this.adminsService.create(registerAdminDto);
    if (result.error) return Res.error(result.message, result.status);
    else return Res.created(result.data, result.message);
  }

  async loginAdmin(loginAdminDto: LoginAdminDto) {
    try {
      const admin = await this.adminsService.findOneForAuth({
        email: loginAdminDto.email,
      });
      if (!admin)
        return Res.error(
          'Incorrect username or password. Please try again.',
          401,
        );
      if (admin.deleted) return Res.error('Account has been deactivated.', 401);

      if (loginAdminDto.loginType === 'otp') {
        if (loginAdminDto.code) {
          // Step 2: Verify OTP code and complete login
          const storedCode = await this.redis.get(
            `admin_otp:${admin._id.toString()}`,
          );
          if (!storedCode) {
            return Res.error(
              'OTP code has expired. Please request a new code.',
              401,
            );
          }
          if (storedCode !== loginAdminDto.code) {
            return Res.error('Invalid OTP code. Please try again.', 401);
          }
          // Delete the used OTP code from Redis
          await this.redis.del(`admin_otp:${admin._id.toString()}`);
        } else {
          // Step 1: Generate and send OTP code
          const newCode = Helper.generateRandomCode(6);

          // Store OTP in Redis with expiration (5 minutes)
          await this.redis.setex(
            `admin_otp:${admin._id.toString()}`,
            300, // 5 minutes in seconds
            newCode,
          );

          // Send OTP via email or SMS
          // await this.sendOTPByEmail(admin.email, newCode);    //TBC
          return Res.ok({ code: newCode }, 'OTP code sent successfully.');
        }

        //Login with password
      } else {
        if (!loginAdminDto.password)
          return Res.error('Password is required.', 400);
        if (
          !(await this.bcryptService.compare(
            loginAdminDto.password,
            admin.password,
          ))
        ) {
          return Res.error(
            'Incorrect username or password. Please try again.',
            401,
          );
        }
      }

      const tokens = this.jwtAuthService.generateUserToken(admin);
      // await this.adminsService.
      return Res.ok({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userData: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        },
      });
    } catch (err) {
      const { message, status } = getErrorData(err);
      return Res.error(message, status);
    }
  }

  // customerRegister(registerCustomerDto: RegisterCustomerDto) {
  //   return 'This action adds a new customer';
  // }

  login() {
    return `login successful`;
  }
}
