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
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { RabbitMQService } from '../../common/modules/rabbitmq/rabbitmq.service';
// import {
//   QUEUES,
//   EVENTS,
// } from 'src/common/modules/rabbitmq/constants/events';
import Helper from 'src/utils/helpers';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    private readonly bcryptService: BcryptService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async registerSelf(createCustomerDto: CreateCustomerDto) {
    const { firstName, lastName, email, password, phoneNumber } =
      createCustomerDto;
    const createdCustomer = new this.customerModel({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
    });
    await createdCustomer.save();
    return {
      message: 'success',
      // data: result as CustomerDocument,
    };
  }

  // async createByAdmin(createCustomerDto: CreateCustomerDto) {
  //     // 1. Check for duplicate email
  //     const duplicateEmail = await this.findByEmail(createCustomerDto.email);
  //     if (duplicateEmail) {
  //       return {
  //         error: true,
  //         message: 'Customer already exists.',
  //         status: 400,
  //       };
  //     }
  //     // 2. Hash password
  //     const hashedPassword = await this.bcryptService.hash(
  //       createCustomerDto.password,
  //     );
  //     createCustomerDto.password = hashedPassword;
  //     const createdCustomer = new this.customerModel(createCustomerDto);
  //     await createdCustomer.save();
  //     const { password, ...result } = createdCustomer.toObject();
  //     return {
  //       error: false,
  //       message: 'success',
  //       status: 201,
  //       data: result as CustomerDocument,
  //     };
  // }

  // async findAll(
  //   queryParams: QueryCustomerDto = {},
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
  //     const filters: FilterQuery<Customer> = buildFilters<Customer>(
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
  //     let query = this.customerModel
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
  //       this.customerModel.countDocuments(filters).exec(),
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
    filter: FilterQuery<Customer>,
    projection?: ProjectionType<Customer>,
    options?: QueryOptions<Customer>,
  ) {
    return await this.customerModel.findOne(filter, projection, options).exec();
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<Customer>,
    options?: QueryOptions<Customer>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.customerModel.findById(id, projection, options).exec();
  }

  async findByEmail(
    email: string,
    projection?: ProjectionType<Customer>,
    options?: QueryOptions<Customer>,
  ) {
    return await this.customerModel
      .findOne({ email: email.toLowerCase().trim() }, projection, options)
      .exec();
  }

  // For authentication (includes password)
  async findOneForAuth(filter: FilterQuery<Customer>) {
    return await this.customerModel
      .findOne(filter)
      .select('+password +emailVerify'); // Include password only for auth
  }

  async findOneAndUpdate(
    filter: FilterQuery<Customer>,
    updateObject: UpdateQuery<Customer>,
    options?: QueryOptions<Customer>,
  ) {
    // Hash password if being updated
    if (updateObject.password) {
      updateObject.password = await this.bcryptService.hash(
        updateObject.password,
      );
    }
    const updatedDoc = await this.customerModel
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

  async updateOne(
    filter: FilterQuery<Customer>,
    updateObject: UpdateQuery<Customer>,
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
    const result = await this.customerModel.updateOne(filter, updateData, {
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
  //   filter: FilterQuery<Customer>,
  //   updateCustomerDto: UpdateCustomerDto,
  // ) {
  //     // Note: Passwords cannot be updated via bulk operations for security
  //     const result = await this.customerModel.updateMany(
  //       filter,
  //       updateCustomerDto,
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

  // async softDelete(filter: FilterQuery<Customer>) {
  //     const result = await this.customerModel.findOneAndUpdate(
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

  // async hardDelete(filter: FilterQuery<Customer>) {
  //     const result = await this.customerModel.findOneAndDelete(filter);
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
  //     const result = await this.customerModel.aggregate(pipeline).exec();
  //     return {
  //       error: false,
  //       message: 'Aggregation completed successfully.',
  //       status: 200,
  //       data: result,
  //     };
  // }
}
