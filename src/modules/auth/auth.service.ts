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
import { CustomersService } from '../customers/customers.service';
import { VerifyAccountDto } from './dto/verify-account-auth.dto';
import { EmailVerification } from 'src/common/schemas/email-verification.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly customersService: CustomersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtAuthService: JwtAuthService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const result = await this.adminsService.create(registerAdminDto);
    if (result.error)  throw Res.error(result.message, result.status);
    else return Res.created(result.data, result.message);
  }

  async loginAdmin(loginAdminDto: LoginAdminDto) {
    try {
      const admin = await this.adminsService.findOneForAuth({
        email: loginAdminDto.email,
      });
      if (!admin)
         throw Res.error(
          'Incorrect username or password. Please try again.',
          401,
        );
      if (admin.deleted) throw Res.error('Account has been deactivated.', 401);

      if (loginAdminDto.loginType === 'otp') {
        if (loginAdminDto.code) {
          // Step 2: Verify OTP code and complete login
          const storedCode = await this.redis.get(
            `admin_otp:${admin._id.toString()}`,
          );
          if (!storedCode) {
            throw Res.error(
              'OTP code has expired. Please request a new code.',
              401,
            );
          }
          if (storedCode !== loginAdminDto.code) {
            throw Res.error('Invalid OTP code. Please try again.', 401);
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
           throw Res.error('Password is required.', 400);
        if (
          !(await this.bcryptService.compare(
            loginAdminDto.password,
            admin.password,
          ))
        ) {
           throw Res.error(
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
      throw Res.error(message, status);
    }
  }

  async registerCustomer(registerCustomerDto: RegisterCustomerDto) {
    const result =
      await this.customersService.registerSelf(registerCustomerDto);
    if (result.error) throw Res.error(result.message, result.status);
    else return Res.created(result.data, result.message);
  }

  async loginCustomer(loginCustomerDto: LoginCustomerDto) {
    try {
      const customer = await this.customersService.findOneForAuth({
        email: loginCustomerDto.email,
      });
      if (!customer)
        throw Res.error(
          'Incorrect username or password. Please try again.',
          401,
        );
      if (customer.deleted)
        throw Res.error('Account has been deactivated.', 401);

      if (loginCustomerDto.loginType === 'otp') {
        if (loginCustomerDto.code) {
          // Step 2: Verify OTP code and complete login
          const storedCode = await this.redis.get(
            `customer_otp:${customer._id.toString()}`,
          );
          if (!storedCode) {
            throw Res.error(
              'OTP code has expired. Please request a new code.',
              401,
            );
          }
          if (storedCode !== loginCustomerDto.code) {
            throw Res.error('Invalid OTP code. Please try again.', 401);
          }
          // Delete the used OTP code from Redis
          await this.redis.del(`customer_otp:${customer._id.toString()}`);
        } else {
          // Step 1: Generate and send OTP code
          const newCode = Helper.generateRandomCode(6);

          // Store OTP in Redis with expiration (5 minutes)
          await this.redis.setex(
            `customer_otp:${customer._id.toString()}`,
            300, // 5 minutes in seconds
            newCode,
          );

          // Send OTP via email or SMS
          // await this.sendOTPByEmail(customer.email, newCode);    //TBC
          return Res.ok({ code: newCode }, 'OTP code sent successfully.');
        }

        //Login with password
      } else {
        if (!loginCustomerDto.password)
          throw Res.error('Password is required.', 400);
        if (
          !(await this.bcryptService.compare(
            loginCustomerDto.password,
            customer.password,
          ))
        ) {
          throw Res.error(
            'Incorrect username or password. Please try again.',
            401,
          );
        }
      }

      const tokens = this.jwtAuthService.generateUserToken(customer);
      // await this.customersService.
      return Res.ok({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userData: {
          id: customer._id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          role: customer.role,
        },
      });
    } catch (err) {
      const { message, status } = getErrorData(err);
      throw Res.error(message, status);
    }
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    try {
      const { email, verifyCode } = verifyAccountDto;
      let userType = 'customer';
      let user: Record<string, any> | null = null;
      const admin = await this.adminsService.findOneForAuth({ email });
      if (admin) {
        userType = 'admin';
        user = admin;
      }
      if (!admin) {
        const customer = await this.customersService.findOneForAuth({ email });
        if (customer) user = customer;
      }
      if (!user) throw Res.error('User not found.', 404);
      const { code, status } = user.emailVerify as EmailVerification;
      if (status === 'verified') {
        throw Res.error('Account is already verified.', 400);
      }
      if (code !== verifyCode) {
        throw Res.error('Invalid verification code.', 400);
      }
      const updateObject = {
        $set: {
          'emailVerify.code': null,
          'emailVerify.status': 'verified',
          'emailVerify.verifiedAt': new Date(),
        },
      };
      let updatedDoc: Record<string, any> | null = null;
      if (userType === 'admin') {
        updatedDoc = await this.adminsService.findOneAndUpdate(
          {
            _id: user._id,
          },
          updateObject,
          { new: true, runValidators: true },
        );
      } else if (userType === 'customer') {
        updatedDoc = await this.customersService.findOneAndUpdate(
          {
            _id: user._id,
          },
          updateObject,
          { new: true, runValidators: true },
        );
      }
      if (!updatedDoc) {
        throw Res.error('Failed to verify account. Please try again.', 400);
      }

      return Res.ok(null, 'Account verified successfully.');
    } catch (err) {
      const { message, status } = getErrorData(err);
      throw Res.error(message, status);
    }
  }
}
