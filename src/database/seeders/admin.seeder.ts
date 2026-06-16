import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { ConfigService } from '@nestjs/config';

import { Admin, AdminDocument } from 'src/modules/admins/schemas/admin.schema';

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    const adminCount = await this.adminModel.countDocuments();

    if (adminCount > 0) {
      this.logger.log('Admin records already exist. Skipping seed.');
      return;
    }

    const password = this.configService.get<string>(
      'bcrypt.defaultPassword',
    ) as string;
    const hashedPassword = await this.bcryptService.hash(password);

    await this.adminModel.insertMany([
      {
        firstName: 'Super',
        lastName: 'Admin',
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
      },
      {
        firstName: 'System',
        lastName: 'Admin',
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
      },
    ]);

    this.logger.log('Admin seed completed.');
  }
}
