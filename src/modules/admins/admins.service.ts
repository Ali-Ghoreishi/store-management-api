import {
  HttpException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  FilterQuery,
  PipelineStage,
  Types,
  UpdateQuery,
  QueryOptions,
  ProjectionType,
} from 'mongoose';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { QueryAdminDto } from './dto/query-admin.dto';
import { buildFilters } from 'src/common/helpers/build-filters.helper';
import { getPaginationOptions } from 'src/common/helpers/pagination.helper';
import { FindAllOptions } from 'src/common/types/find-all-options.interface';

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
      throw new BadRequestException('Admin already exists.');
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

  async findAll(queryParams: QueryAdminDto = {}, options: FindAllOptions = {}) {
    // const {
    //   enablePopulate = true,
    //   select = '-password', // Default exclude password
    //   withPassword = false,
    //   withDeleted = false,
    //   populationFields = ['role', 'createdBy', 'updatedBy'],
    // } = options;
    // Build filters with proper typing
    const filters: FilterQuery<Admin> = buildFilters<Admin>(queryParams, {
      searchFields: ['firstName', 'lastName', 'email'],
      exactMatchFields: [
        'firstName',
        'lastName',
        'email',
        'role',
        'status',
        'phoneNumber',
      ],
      searchTerm: 'search',
      caseSensitive: false,
      customFilters: {
        deleted: (value) => value === 'true', // convert string to boolean
        // minAge: (value) => ({ $gte: parseInt(value) }),
        // maxAge: (value) => ({ $lte: parseInt(value) }),
        // isActive: (value) => value === 'true',
      },
    });

    // Get pagination options
    const { skip, limit, sort, page } = getPaginationOptions(queryParams);
    //
    // Build query with population
    let query = this.adminModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Apply population if enabled
    // if (enablePopulate) {
    //   populationFields.forEach((field) => {
    //     switch (field) {
    //       case 'role':
    //         query = query.populate('role', 'name permissions');
    //         break;
    //       case 'createdBy':
    //         query = query.populate('createdBy', 'firstName lastName email');
    //         break;
    //       case 'updatedBy':
    //         query = query.populate('updatedBy', 'firstName lastName email');
    //         break;
    //       case 'permissions':
    //         query = query.populate('permissions', 'name resource action');
    //         break;
    //       default:
    //         query = query.populate(field);
    //     }
    //   });
    // }

    const [data, total] = await Promise.all([
      query.exec(),
      this.adminModel.countDocuments(filters).exec(),
    ]);

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findOne(
    filter: FilterQuery<Admin>,
    projection?: ProjectionType<Admin>,
    options?: QueryOptions<Admin>,
  ) {
    return await this.adminModel.findOne(filter, projection, options).exec();
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<Admin>,
    options?: QueryOptions<Admin>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.adminModel.findById(id, projection, options).exec();
  }

  async findByEmail(
    email: string,
    projection?: ProjectionType<Admin>,
    options?: QueryOptions<Admin>,
  ) {
    return await this.adminModel
      .findOne({ email: email.toLowerCase().trim() }, projection, options)
      .exec();
  }

  // For authentication (includes password)
  async findOneForAuth(
    filter: FilterQuery<Admin>,
    options?: QueryOptions<Admin>,
  ) {
    return await this.adminModel
      .findOne(filter)
      .select('+password +emailVerify'); // Include password only for auth
  }

  async findOneAndUpdate(
    filter: FilterQuery<Admin>,
    updateObject: UpdateQuery<Admin>,
    options?: QueryOptions<Admin>,
  ) {
    // Hash password if being updated
    if (updateObject.password) {
      updateObject.password = await this.bcryptService.hash(
        updateObject.password,
      );
    }
    const updatedDoc = await this.adminModel
      .findOneAndUpdate(filter, updateObject, options)
      .exec();

    if (!updatedDoc) {
      throw new NotFoundException('Record not found.');
    }
    return {
      message: 'Updated successfully.',
      data: { updatedDoc },
    };
  }

  async updateOne(
    filter: FilterQuery<Admin>,
    updateObject: UpdateQuery<Admin>,
  ) {
    // Create update object without mutating the DTO
    const updateData = {
      ...updateObject,
      updatedAt: new Date(),
    };
    // Hash password if being updated
    if (updateObject.password) {
      updateData.password = await this.bcryptService.hash(
        updateObject.password,
      );
    }
    const result = await this.adminModel.updateOne(filter, updateData, {
      runValidators: true,
    });
    if (result.matchedCount === 0) {
      throw new NotFoundException('Record not found.');
    }
    // if (result.modifiedCount === 0) {}
    return {
      message: 'Updated successfully.',
      data: { modifiedCount: result.modifiedCount },
    };
  }

  async updateMany(
    filter: FilterQuery<Admin>,
    updateObject: UpdateQuery<Admin>,
  ) {
    // Note: Passwords cannot be updated via bulk operations for security
    const result = await this.adminModel.updateMany(filter, updateObject, {
      runValidators: true,
    });
    if (result.matchedCount === 0) {
      throw new NotFoundException('No records found.');
    }
    // if (result.modifiedCount === 0) {}
    return {
      message: `Updated ${result.modifiedCount} record(s) successfully.`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    };
  }

  async softDelete(filter: FilterQuery<Admin>) {
    const result = await this.adminModel.findOneAndUpdate(
      filter,
      {
        deleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException('Record not found.');
    }
    return {
      message: 'Record soft deleted successfully.',
      data: { deletedAt: result.deletedAt },
    };
  }

  async hardDelete(filter: FilterQuery<Admin>) {
    const result = await this.adminModel.findOneAndDelete(filter);
    if (!result) {
      throw new NotFoundException('Record not found.');
    }
    return {
      message: 'Record permanently deleted successfully.',
      data: { deletedId: result._id },
    };
  }

  async aggregate<T = any>(
    pipeline: PipelineStage[],
  ): Promise<{
    message: string;
    data?: T[];
  }> {
    const result = await this.adminModel.aggregate(pipeline).exec();
    return {
      message: 'Aggregation completed successfully.',
      data: result,
    };
  }
}
