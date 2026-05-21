import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, PipelineStage, Types } from 'mongoose';

import { getErrorData } from 'src/common/helpers/error.helper';
// import { CreateCustomerDto } from './dto/create-customer.dto';
// import { UpdateAdminDto } from './dto/update-admin.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private adminModel: Model<CustomerDocument>,
    private readonly bcryptService: BcryptService,
  ) {}

  // async create(createAdminDto: CreateAdminDto) {
  //   try {
  //     // 1. Check for duplicate email
  //     const duplicateEmail = await this.findByEmail(createAdminDto.email);
  //     if (duplicateEmail) {
  //       return {
  //         error: true,
  //         message: 'Admin already exists.',
  //         status: 400,
  //       };
  //     }
  //     // 2. Hash password
  //     const hashedPassword = await this.bcryptService.hash(
  //       createAdminDto.password,
  //     );
  //     createAdminDto.password = hashedPassword;
  //     const createdAdmin = new this.adminModel(createAdminDto);
  //     await createdAdmin.save();
  //     const { password, ...result } = createdAdmin.toObject();
  //     return {
  //       error: false,
  //       message: 'success',
  //       status: 201,
  //       data: result as AdminDocument,
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async findAll(
  //   filter: FilterQuery<Admin> = {},
  //   page: number = 1,
  //   limit: number = 10,
  //   sortBy: string = 'createdAt',
  //   sortOrder: 'asc' | 'desc' = 'desc',
  // ) {
  //   const skip = (page - 1) * limit;
  //   const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 } as {
  //     [key: string]: 1 | -1;
  //   };
  //   const [data, total] = await Promise.all([
  //     this.adminModel
  //       .find(filter)
  //       .sort(sort)
  //       .skip(skip)
  //       .limit(limit)
  //       //.select('-password') // Exclude password
  //       .exec(),
  //     this.adminModel.countDocuments(filter).exec(),
  //   ]);

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }

  // async findOne(filter: FilterQuery<Admin>) {
  //   return await this.adminModel.findOne(filter);
  // }

  // async findById(id: string | Types.ObjectId) {
  //   return await this.adminModel.findById(id);
  // }

  // async findByEmail(email: string) {
  //   return await this.adminModel.findOne({ email });
  // }

  // // For authentication (includes password)
  // async findOneForAuth(filter: FilterQuery<Admin>) {
  //   return await this.adminModel.findOne(filter).select('+password'); // Include password only for auth
  // }

  // async findOneAndUpdate(
  //   filter: FilterQuery<Admin>,
  //   updateAdminDto: UpdateAdminDto,
  // ) {
  //   try {
  //     // Create update object without mutating the DTO
  //     const updateData = {
  //       ...updateAdminDto,
  //       updatedAt: new Date(),
  //     };
  //     // Hash password if being updated
  //     if (updateAdminDto.password) {
  //       updateData.password = await this.bcryptService.hash(
  //         updateAdminDto.password,
  //       );
  //     }
  //     const updatedDoc = await this.adminModel.findOneAndUpdate(
  //       filter,
  //       updateData,
  //       { new: true, runValidators: true },
  //     );
  //     if (!updatedDoc) {
  //       return {
  //         error: true,
  //         message: 'Record not found.',
  //         status: 404,
  //       };
  //     }
  //     return {
  //       error: false,
  //       message: 'Updated successfully',
  //       status: 200,
  //       data: { updatedDoc },
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async updateOne(filter: FilterQuery<Admin>, updateAdminDto: UpdateAdminDto) {
  //   try {
  //     // Create update object without mutating the DTO
  //     const updateData = {
  //       ...updateAdminDto,
  //       updatedAt: new Date(),
  //     };
  //     // Hash password if being updated
  //     if (updateAdminDto.password) {
  //       updateData.password = await this.bcryptService.hash(
  //         updateAdminDto.password,
  //       );
  //     }
  //     const result = await this.adminModel.updateOne(filter, updateData, {
  //       runValidators: true,
  //     });
  //     if (result.matchedCount === 0) {
  //       return { error: true, message: 'Record not found.', status: 404 };
  //     }
  //     if (result.modifiedCount === 0) {
  //       return {
  //         error: false,
  //         message: 'No changes made.',
  //         status: 304,
  //         data: {},
  //       };
  //     }
  //     return {
  //       error: false,
  //       message: 'Updated successfully.',
  //       status: 200,
  //       data: { modifiedCount: result.modifiedCount },
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async updateMany(filter: FilterQuery<Admin>, updateAdminDto: UpdateAdminDto) {
  //   try {
  //     // Note: Passwords cannot be updated via bulk operations for security
  //     const result = await this.adminModel.updateMany(filter, updateAdminDto, {
  //       runValidators: true,
  //     });
  //     if (result.matchedCount === 0) {
  //       return { error: true, message: 'No records found.', status: 404 };
  //     }
  //     if (result.modifiedCount === 0) {
  //       return { error: false, message: 'No changes made.', status: 304 };
  //     }
  //     return {
  //       error: false,
  //       message: `Updated ${result.modifiedCount} record(s) successfully.`,
  //       status: 200,
  //       data: {
  //         matchedCount: result.matchedCount,
  //         modifiedCount: result.modifiedCount,
  //       },
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async softDelete(filter: FilterQuery<Admin>) {
  //   try {
  //     const result = await this.adminModel.findOneAndUpdate(
  //       filter,
  //       {
  //         deleted: true,
  //         deletedAt: new Date(),
  //         updatedAt: new Date(),
  //       },
  //       { new: true },
  //     );
  //     if (!result) {
  //       return {
  //         error: true,
  //         message: 'Record not found.',
  //         status: 404,
  //       };
  //     }
  //     return {
  //       error: false,
  //       message: 'Record soft deleted successfully.',
  //       status: 200,
  //       data: { deletedAt: result.deletedAt },
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async hardDelete(filter: FilterQuery<Admin>) {
  //   try {
  //     const result = await this.adminModel.findOneAndDelete(filter);
  //     if (!result) {
  //       return {
  //         error: true,
  //         message: 'Record not found.',
  //         status: 404,
  //       };
  //     }
  //     return {
  //       error: false,
  //       message: 'Record permanently deleted successfully.',
  //       status: 200,
  //       data: { deletedId: result._id },
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async aggregate<T = any>(
  //   pipeline: PipelineStage[],
  // ): Promise<{
  //   error: boolean;
  //   message: string;
  //   status: number;
  //   data?: T[];
  // }> {
  //   try {
  //     const result = await this.adminModel.aggregate(pipeline).exec();
  //     return {
  //       error: false,
  //       message: 'Aggregation completed successfully.',
  //       status: 200,
  //       data: result,
  //     };
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }
}
