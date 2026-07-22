import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import Res from '../../common/helpers/response.helper';
import { RegisterAdminDto, RegisterCustomerDto } from './dto/register-auth.dto';
import { LoginUserDto } from './dto/login-auth.dto';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { JwtAuthService } from 'src/common/services/jwt.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import Helper from '../../utils/helpers';
import { UsersService } from '../users/users.service';
import { VerifyAccountDto } from './dto/verify-account-auth.dto';
import { EmailVerification } from 'src/common/schemas/email-verification.schema';
import { UserType } from '../users/schemas/user.schema';
import { RabbitMQService } from '../../common/modules/rabbitmq/rabbitmq.service';
import { RabbitMQEvents } from 'src/common/modules/rabbitmq/constants/events';
import { RabbitMQServices } from 'src/common/modules/rabbitmq/constants/services';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly rabbitMQService: RabbitMQService,
    @InjectRedis() private readonly redis: Redis,
    // @Inject('AUTH_CLIENT') private readonly eventClient: ClientProxy,
  ) {}

  async loginAdmin(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneForAuth({
      email: loginUserDto.email,
    });
    if (!user)
      throw new UnauthorizedException(
        'Incorrect username or password. Please try again.',
      );
    if (user.deleted)
      throw new UnauthorizedException('Account has been deactivated.');

    if (loginUserDto.loginType === 'otp') {
      if (loginUserDto.code) {
        // Step 2: Verify OTP code and complete login
        const storedCode = await this.redis.get(
          `admin_otp:${user._id.toString()}`,
        );
        if (!storedCode) {
          throw new UnauthorizedException(
            'OTP code has expired. Please request a new code.',
          );
        }
        if (storedCode !== loginUserDto.code) {
          throw new UnauthorizedException(
            'Invalid OTP code. Please try again.',
          );
        }
        // Delete the used OTP code from Redis
        await this.redis.del(`admin_otp:${user._id.toString()}`);
      } else {
        // Step 1: Generate and send OTP code
        const newCode = Helper.generateRandomCode(6);

        // Store OTP in Redis with expiration (5 minutes)
        await this.redis.setex(
          `admin_otp:${user._id.toString()}`,
          300, // 5 minutes in seconds
          newCode,
        );

        // Send OTP via email or SMS
        // await this.sendOTPByEmail(user.email, newCode);    //TBC
        return {
          message: 'OTP code sent successfully.',
          data: {},
        };
      }

      //Login with password
    } else {
      if (!loginUserDto.password)
        throw new BadRequestException('Password is required.');
      if (
        !(await this.bcryptService.compare(
          loginUserDto.password,
          user.password,
        ))
      ) {
        throw new UnauthorizedException(
          'Incorrect username or password. Please try again.',
        );
      }
    }

    const tokens = this.jwtAuthService.generateUserToken(user);
    return {
      message: 'success.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userData: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async registerCustomer(registerCustomerDto: RegisterCustomerDto) {
    return await this.usersService.registerSelf(registerCustomerDto);
  }

  async loginCustomer(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneForAuth({
      email: loginUserDto.email,
    });
    if (!user)
      throw new UnauthorizedException(
        'Incorrect username or password. Please try again.',
      );
    if (user.deleted)
      throw new UnauthorizedException('Account has been deactivated.');

    if (loginUserDto.loginType === 'otp') {
      if (loginUserDto.code) {
        // Step 2: Verify OTP code and complete login
        const storedCode = await this.redis.get(
          `customer_otp:${user._id.toString()}`,
        );
        if (!storedCode) {
          throw new UnauthorizedException(
            'OTP code has expired. Please request a new code.',
          );
        }
        if (storedCode !== loginUserDto.code) {
          throw new UnauthorizedException(
            'Invalid OTP code. Please try again.',
          );
        }
        // Delete the used OTP code from Redis
        await this.redis.del(`customer_otp:${user._id.toString()}`);
      } else {
        // Step 1: Generate and send OTP code
        const newCode = Helper.generateRandomCode(6);

        // Store OTP in Redis with expiration (5 minutes)
        await this.redis.setex(
          `customer_otp:${user._id.toString()}`,
          300, // 5 minutes in seconds
          newCode,
        );

        // Send OTP via email or SMS
        // await this.sendOTPByEmail(user.email, newCode);    //TBC
        return {
          message: 'OTP code sent successfully.',
          data: {},
        };
      }

      //Login with password
    } else {
      if (!loginUserDto.password)
        throw new BadRequestException('Password is required.');
      if (
        !(await this.bcryptService.compare(
          loginUserDto.password,
          user.password,
        ))
      ) {
        throw new UnauthorizedException(
          'Incorrect username or password. Please try again.',
        );
      }
    }

    const tokens = this.jwtAuthService.generateUserToken(user);
    return {
      message: 'success.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userData: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    const { email, verifyCode } = verifyAccountDto;
    const user = await this.usersService.findOneForAuth({ email });
    if (!user) throw new NotFoundException('User not found.');
    const userType = user.userType;
    const { code, status } = user.emailVerify; /* as EmailVerification; */
    if (status === 'verified') {
      throw new BadRequestException('Account is already verified.');
    }
    if (code !== verifyCode) {
      throw new BadRequestException('Invalid verification code.');
    }
    const currentTime = new Date();
    const updateObject = {
      $set: {
        'emailVerify.code': null,
        'emailVerify.status': 'verified',
        'emailVerify.verifiedAt': currentTime,
      },
    };
    const updatedDoc = await this.usersService.findOneAndUpdate(
      {
        _id: user._id,
      },
      updateObject,
      { new: true, runValidators: true },
    );
    if (!updatedDoc)
      throw new BadRequestException(
        'Failed to verify account. Please try again.',
      );

    // update user
    {
      this.rabbitMQService.emit(
        RabbitMQServices.USER,
        RabbitMQEvents.USER_UPDATED,
        {
          doc: { email: user.email },
          updateObj: {
            emailVerify: {
              code: null,
              status: 'verified',
              verifiedAt: currentTime,
            },
          },
        },
      );
    }

    return {
      message: 'Account verified successfully.',
      data: {},
    };
  }
}
