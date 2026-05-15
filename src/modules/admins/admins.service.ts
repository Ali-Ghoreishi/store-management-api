import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name)
    private adminModel: Model<AdminDocument>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminDocument> {
    // 1. Check for duplicate email
    const duplicateEmail = await this.findByEmail(createAdminDto.email);
    if (duplicateEmail) {
      throw new HttpException('Admin already exists.', 400);
    }
    // 2. Hash password
    const hashedPassword = await this.bcryptService.hash(
      createAdminDto.password,
    );
    createAdminDto.password = hashedPassword;
    const createdAdmin = new this.adminModel(createAdminDto);
    return await createdAdmin.save();
  }

  findAll() {
    return this.adminModel.find();
  }

  async findOne(filter: FilterQuery<Admin>): Promise<AdminDocument | null> {
    return await this.adminModel.findOne(filter);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return await this.adminModel.findOne({ email });
  }

  // For authentication (includes password)
  async findOneForAuth(
    filter: FilterQuery<Admin>,
  ): Promise<AdminDocument | null> {
    return await this.adminModel.findOne(filter).select('+password'); // Include password only for auth
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
