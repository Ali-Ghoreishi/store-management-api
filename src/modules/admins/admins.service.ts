import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, PipelineStage } from 'mongoose';

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

  async create(createAdminDto: CreateAdminDto) {
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
    await createdAdmin.save();
    const { password, ...result } = createdAdmin.toObject();
    return result as AdminDocument;
  }

  async findAll(
    filter: FilterQuery<Admin> = {},
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 } as {
      [key: string]: 1 | -1;
    };
    const [data, total] = await Promise.all([
      this.adminModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password') // Exclude password
        .exec(),
      this.adminModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(filter: FilterQuery<Admin>) {
    return await this.adminModel.findOne(filter);
  }

  async findByEmail(email: string) {
    return await this.adminModel.findOne({ email });
  }

  // For authentication (includes password)
  async findOneForAuth(filter: FilterQuery<Admin>) {
    return await this.adminModel.findOne(filter).select('+password'); // Include password only for auth
  }

  async updateMany(filter: FilterQuery<Admin>, updateAdminDto: UpdateAdminDto) {
    return await this.adminModel.updateMany(filter, updateAdminDto);
  }

  async updateOne(filter: FilterQuery<Admin>, updateAdminDto: UpdateAdminDto) {
    return await this.adminModel.updateOne(filter, updateAdminDto);
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  /**
   * Execute aggregation pipeline
   * @param pipeline - Mongoose aggregation pipeline stages
   * @returns Aggregation result
   */
  async aggregate(pipeline: PipelineStage[]) {
    try {
      return await this.adminModel.aggregate(pipeline).exec();
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
