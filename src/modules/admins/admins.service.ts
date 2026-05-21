import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, PipelineStage, Types } from 'mongoose';

import { getErrorData } from 'src/common/helpers/error.helper';
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
    try {
      // 1. Check for duplicate email
      const duplicateEmail = await this.findByEmail(createAdminDto.email);
      if (duplicateEmail) {
        return {
          error: true,
          message: 'Admin already exists.',
          status: 400,
        };
      }
      // 2. Hash password
      const hashedPassword = await this.bcryptService.hash(
        createAdminDto.password,
      );
      createAdminDto.password = hashedPassword;
      const createdAdmin = new this.adminModel(createAdminDto);
      await createdAdmin.save();
      const { password, ...result } = createdAdmin.toObject();
      return {
        error: false,
        message: 'success',
        status: 201,
        data: result as AdminDocument,
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async findAll(queryParams: QueryAdminDto = {}, options: FindAllOptions = {}) {
    try {
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
        error: false,
        message: 'success',
        status: 200,
        data: {
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          result: data,
        },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async findOne(filter: FilterQuery<Admin>) {
    return await this.adminModel.findOne(filter);
  }

  async findById(id: string | Types.ObjectId) {
    return await this.adminModel.findById(id);
  }

  async findByEmail(email: string) {
    return await this.adminModel.findOne({ email });
  }

  // For authentication (includes password)
  async findOneForAuth(filter: FilterQuery<Admin>) {
    return await this.adminModel.findOne(filter).select('+password'); // Include password only for auth
  }

  async findOneAndUpdate(
    filter: FilterQuery<Admin>,
    updateAdminDto: UpdateAdminDto,
  ) {
    try {
      // Create update object without mutating the DTO
      const updateData = {
        ...updateAdminDto,
        updatedAt: new Date(),
      };
      // Hash password if being updated
      if (updateAdminDto.password) {
        updateData.password = await this.bcryptService.hash(
          updateAdminDto.password,
        );
      }
      const updatedDoc = await this.adminModel.findOneAndUpdate(
        filter,
        updateData,
        { new: true, runValidators: true },
      );
      if (!updatedDoc) {
        return {
          error: true,
          message: 'Record not found.',
          status: 404,
        };
      }
      return {
        error: false,
        message: 'Updated successfully',
        status: 200,
        data: { updatedDoc },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async updateOne(filter: FilterQuery<Admin>, updateAdminDto: UpdateAdminDto) {
    try {
      // Create update object without mutating the DTO
      const updateData = {
        ...updateAdminDto,
        updatedAt: new Date(),
      };
      // Hash password if being updated
      if (updateAdminDto.password) {
        updateData.password = await this.bcryptService.hash(
          updateAdminDto.password,
        );
      }
      const result = await this.adminModel.updateOne(filter, updateData, {
        runValidators: true,
      });
      if (result.matchedCount === 0) {
        return { error: true, message: 'Record not found.', status: 404 };
      }
      if (result.modifiedCount === 0) {
        return {
          error: false,
          message: 'No changes made.',
          status: 304,
          data: {},
        };
      }
      return {
        error: false,
        message: 'Updated successfully.',
        status: 200,
        data: { modifiedCount: result.modifiedCount },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async updateMany(filter: FilterQuery<Admin>, updateAdminDto: UpdateAdminDto) {
    try {
      // Note: Passwords cannot be updated via bulk operations for security
      const result = await this.adminModel.updateMany(filter, updateAdminDto, {
        runValidators: true,
      });
      if (result.matchedCount === 0) {
        return { error: true, message: 'No records found.', status: 404 };
      }
      if (result.modifiedCount === 0) {
        return { error: false, message: 'No changes made.', status: 304 };
      }
      return {
        error: false,
        message: `Updated ${result.modifiedCount} record(s) successfully.`,
        status: 200,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async softDelete(filter: FilterQuery<Admin>) {
    try {
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
        return {
          error: true,
          message: 'Record not found.',
          status: 404,
        };
      }
      return {
        error: false,
        message: 'Record soft deleted successfully.',
        status: 200,
        data: { deletedAt: result.deletedAt },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async hardDelete(filter: FilterQuery<Admin>) {
    try {
      const result = await this.adminModel.findOneAndDelete(filter);
      if (!result) {
        return {
          error: true,
          message: 'Record not found.',
          status: 404,
        };
      }
      return {
        error: false,
        message: 'Record permanently deleted successfully.',
        status: 200,
        data: { deletedId: result._id },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  async aggregate<T = any>(
    pipeline: PipelineStage[],
  ): Promise<{
    error: boolean;
    message: string;
    status: number;
    data?: T[];
  }> {
    try {
      const result = await this.adminModel.aggregate(pipeline).exec();
      return {
        error: false,
        message: 'Aggregation completed successfully.',
        status: 200,
        data: result,
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }
}
