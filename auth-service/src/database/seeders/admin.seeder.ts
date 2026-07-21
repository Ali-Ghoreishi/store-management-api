import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { ConfigService } from '@nestjs/config';
import {
  User,
  UserDocument,
  UserType,
} from 'src/modules/users/schemas/user.schema';

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    const adminCount = await this.userModel.countDocuments({
      userType: UserType.Admin,
    });

    if (adminCount > 0) {
      this.logger.log('Admin records already exist. Skipping seed.');
      return;
    }

    const password = this.configService.get<string>(
      'bcrypt.defaultPassword',
    ) as string;
    const hashedPassword = await this.bcryptService.hash(password);

    await this.userModel.insertMany([
      {
        email: 'ebrat1377@gmail.com',
        emailVerify: {
          code: null,
          lastRequestTime: null,
          status: 'verified',
          attempts: 1,
          verifiedAt: new Date(),
        },
        password: hashedPassword,
        phoneNumber: '09134437233',
        role: Role.Admin,
        userType: UserType.Admin,
      },
      {
        email: 'admin2@example.com',
        emailVerify: {
          code: null,
          lastRequestTime: null,
          status: 'verified',
          attempts: 1,
          verifiedAt: new Date(),
        },
        password: hashedPassword,
        phoneNumber: '09131111111',
        role: Role.Manager,
        userType: UserType.Admin,
      },
    ]);

    this.logger.log('Admin seed completed.');
  }
}
