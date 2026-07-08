import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
  Injectable,
  Logger,
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

import { getErrorData } from 'src/common/helpers/error.helper';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';
// import { RabbitMQService } from '../../common/modules/rabbitmq/rabbitmq.service';
// import {
//   QUEUES,
//   EVENTS,
// } from '../../common/modules/rabbitmq/rabbitmq.constants';
import Helper from 'src/utils/helpers';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly bcryptService: BcryptService,
    // private readonly rabbitMQService: RabbitMQService,
  ) {}

  // async registerSelf(createUserDto: CreateUserDto) {
  //   const verifyCode = Helper.generateRandomCode(5);
  //   // 1. Check for duplicate email
  //   const duplicateEmail = await this.findByEmail(createUserDto.email);
  //   if (duplicateEmail) {
  //     throw new BadRequestException('User already exists.');
  //   }
  //   // 2. Hash password
  //   const hashedPassword = await this.bcryptService.hash(
  //     createUserDto.password,
  //   );
  //   createUserDto.password = hashedPassword;
  //   const createdUser = new this.userModel({
  //     ...createUserDto,
  //     emailVerify: {
  //       code: verifyCode,
  //       lastRequestTime: new Date(),
  //       attempts: 1,
  //     },
  //   });
  //   await createdUser.save();
  //   const { password, emailVerify, ...result } = createdUser.toObject();

  //   // Send welcome email via RabbitMQ
  //   {
  //     const isEmailSent = await this.rabbitMQService.sendToQueue(
  //       QUEUES.EMAIL_QUEUE,
  //       {
  //         event: EVENTS.EMAIL_WELCOME_User,
  //         data: {
  //           email: createdUser.email,
  //           name: createdUser.firstName,
  //           userId: createdUser._id.toString(),
  //         },
  //         timestamp: new Date(),
  //       },
  //     );
  //     if (!isEmailSent) {
  //       this.logger.warn(
  //         `Failed to queue welcome email for ${createdUser.email}, userId: ${createdUser._id.toString()}`,
  //       );
  //     } else {
  //       this.logger.log(
  //         `Welcome email queued successfully for ${createdUser.email}`,
  //       );
  //     }
  //   }

  //   // Send Verify Account Code via RabbitMQ
  //   {
  //     const isEmailSent = await this.rabbitMQService.sendToQueue(
  //       QUEUES.EMAIL_QUEUE,
  //       {
  //         event: EVENTS.EMAIL_VERIFY_ACCOUNT,
  //         data: {
  //           email: createdUser.email,
  //           name: createdUser.firstName,
  //           code: verifyCode,
  //         },
  //         timestamp: new Date(),
  //       },
  //     );
  //     if (!isEmailSent) {
  //       this.logger.warn(
  //         `Failed to queue welcome email for ${createdUser.email}, userId: ${createdUser._id.toString()}`,
  //       );
  //     } else {
  //       this.logger.log(
  //         `Welcome email queued successfully for ${createdUser.email}`,
  //       );
  //     }
  //   }

  //   return {
  //     message: 'success',
  //     data: result as UserDocument,
  //   };
  // }

  // async createByAdmin(createUserDto: CreateUserDto) {
  //     // 1. Check for duplicate email
  //     const duplicateEmail = await this.findByEmail(createUserDto.email);
  //     if (duplicateEmail) {
  //       return {
  //         error: true,
  //         message: 'User already exists.',
  //         status: 400,
  //       };
  //     }
  //     // 2. Hash password
  //     const hashedPassword = await this.bcryptService.hash(
  //       createUserDto.password,
  //     );
  //     createUserDto.password = hashedPassword;
  //     const createdUser = new this.userModel(createUserDto);
  //     await createdUser.save();
  //     const { password, ...result } = createdUser.toObject();
  //     return {
  //       error: false,
  //       message: 'success',
  //       status: 201,
  //       data: result as UserDocument,
  //     };
  // }

  // async findAll(
  //   queryParams: QueryUserDto = {},
  //   options: FindAllOptions = {},
  // ) {
  //     // const {
  //     //   enablePopulate = true,
  //     //   select = '-password', // Default exclude password
  //     //   withPassword = false,
  //     //   withDeleted = false,
  //     //   populationFields = ['role', 'createdBy', 'updatedBy'],
  //     // } = options;
  //     // Build filters with proper typing
  //     const filters: FilterQuery<User> = buildFilters<User>(
  //       queryParams,
  //       {
  //         searchFields: ['firstName', 'lastName', 'email'],
  //         exactMatchFields: [
  //           'firstName',
  //           'lastName',
  //           'email',
  //           'role',
  //           'status',
  //           'phoneNumber',
  //         ],
  //         searchTerm: 'search',
  //         caseSensitive: false,
  //         customFilters: {
  //           deleted: (value) => value === 'true', // convert string to boolean
  //           // minAge: (value) => ({ $gte: parseInt(value) }),
  //           // maxAge: (value) => ({ $lte: parseInt(value) }),
  //           // isActive: (value) => value === 'true',
  //         },
  //       },
  //     );

  //     // Get pagination options
  //     const { skip, limit, sort, page } = getPaginationOptions(queryParams);

  //     // Build query with population
  //     let query = this.userModel
  //       .find(filters)
  //       .sort(sort)
  //       .skip(skip)
  //       .limit(limit);

  //     // Apply population if enabled
  //     // if (enablePopulate) {
  //     //   populationFields.forEach((field) => {
  //     //     switch (field) {
  //     //       case 'role':
  //     //         query = query.populate('role', 'name permissions');
  //     //         break;
  //     //       case 'createdBy':
  //     //         query = query.populate('createdBy', 'firstName lastName email');
  //     //         break;
  //     //       case 'updatedBy':
  //     //         query = query.populate('updatedBy', 'firstName lastName email');
  //     //         break;
  //     //       case 'permissions':
  //     //         query = query.populate('permissions', 'name resource action');
  //     //         break;
  //     //       default:
  //     //         query = query.populate(field);
  //     //     }
  //     //   });
  //     // }

  //     const [data, total] = await Promise.all([
  //       query.exec(),
  //       this.userModel.countDocuments(filters).exec(),
  //     ]);

  //     return {
  //       error: false,
  //       message: 'success',
  //       status: 200,
  //       data: {
  //         pagination: {
  //           total,
  //           page,
  //           limit,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //         result: data,
  //       },
  //     };
  // }

  async findOne(
    filter: FilterQuery<User>,
    projection?: ProjectionType<User>,
    options?: QueryOptions<User>,
  ) {
    return await this.userModel.findOne(filter, projection, options).exec();
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<User>,
    options?: QueryOptions<User>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.userModel.findById(id, projection, options).exec();
  }

  async findByEmail(
    email: string,
    projection?: ProjectionType<User>,
    options?: QueryOptions<User>,
  ) {
    return await this.userModel
      .findOne({ email: email.toLowerCase().trim() }, projection, options)
      .exec();
  }

  // For authentication (includes password)
  async findOneForAuth(filter: FilterQuery<User>) {
    return await this.userModel
      .findOne(filter)
      .select('+password +emailVerify'); // Include password only for auth
  }

  async findOneAndUpdate(
    filter: FilterQuery<User>,
    updateObject: UpdateQuery<User>,
    options?: QueryOptions<User>,
  ) {
    // Hash password if being updated
    if (updateObject.password) {
      updateObject.password = await this.bcryptService.hash(
        updateObject.password,
      );
    }
    const updatedDoc = await this.userModel
      .findOneAndUpdate(filter, updateObject, options)
      .exec();

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
  }

  async updateOne(filter: FilterQuery<User>, updateObject: UpdateQuery<User>) {
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
    const result = await this.userModel.updateOne(filter, updateData, {
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
  }

  // async updateMany(
  //   filter: FilterQuery<User>,
  //   updateUserDto: UpdateUserDto,
  // ) {
  //     // Note: Passwords cannot be updated via bulk operations for security
  //     const result = await this.userModel.updateMany(
  //       filter,
  //       updateUserDto,
  //       {
  //         runValidators: true,
  //       },
  //     );
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
  // }

  // async softDelete(filter: FilterQuery<User>) {
  //     const result = await this.userModel.findOneAndUpdate(
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
  // }

  // async hardDelete(filter: FilterQuery<User>) {
  //     const result = await this.userModel.findOneAndDelete(filter);
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
  // }

  // async aggregate<T = any>(
  //   pipeline: PipelineStage[],
  // ): Promise<{
  //   error: boolean;
  //   message: string;
  //   status: number;
  //   data?: T[];
  // }> {
  //     const result = await this.userModel.aggregate(pipeline).exec();
  //     return {
  //       error: false,
  //       message: 'Aggregation completed successfully.',
  //       status: 200,
  //       data: result,
  //     };
  // }
}
