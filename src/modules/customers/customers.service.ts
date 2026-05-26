import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  FilterQuery,
  PipelineStage,
  Types,
  UpdateQuery,
} from 'mongoose';

import { getErrorData } from 'src/common/helpers/error.helper';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { RabbitMQService } from '../../common/modules/rabbitmq/rabbitmq.service';
import {
  QUEUES,
  EVENTS,
} from '../../common/modules/rabbitmq/rabbitmq.constants';
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
    try {
      const verifyCode = Helper.generateRandomCode(5);
      // 1. Check for duplicate email
      const duplicateEmail = await this.findByEmail(createCustomerDto.email);
      if (duplicateEmail) {
        return {
          error: true,
          message: 'Customer already exists.',
          status: 400,
        };
      }
      // 2. Hash password
      const hashedPassword = await this.bcryptService.hash(
        createCustomerDto.password,
      );
      createCustomerDto.password = hashedPassword;
      const createdCustomer = new this.customerModel({
        ...createCustomerDto,
        emailVerify: {
          code: verifyCode,
          lastRequestTime: new Date(),
          attempts: 1,
        },
      });
      await createdCustomer.save();
      const { password, emailVerify, ...result } = createdCustomer.toObject();

      // Send welcome email via RabbitMQ
      {
        const isEmailSent = await this.rabbitMQService.sendToQueue(
          QUEUES.EMAIL_QUEUE,
          {
            event: EVENTS.EMAIL_WELCOME_CUSTOMER,
            data: {
              email: createdCustomer.email,
              name: createdCustomer.firstName,
              customerId: createdCustomer._id.toString(),
            },
            timestamp: new Date(),
          },
        );
        if (!isEmailSent) {
          this.logger.warn(
            `Failed to queue welcome email for ${createdCustomer.email}, customerId: ${createdCustomer._id.toString()}`,
          );
        } else {
          this.logger.log(
            `Welcome email queued successfully for ${createdCustomer.email}`,
          );
        }
      }

      // Send Verify Account Code via RabbitMQ
      {
        const isEmailSent = await this.rabbitMQService.sendToQueue(
          QUEUES.EMAIL_QUEUE,
          {
            event: EVENTS.EMAIL_VERIFY_ACCOUNT,
            data: {
              email: createdCustomer.email,
              name: createdCustomer.firstName,
              code: verifyCode,
            },
            timestamp: new Date(),
          },
        );
        if (!isEmailSent) {
          this.logger.warn(
            `Failed to queue welcome email for ${createdCustomer.email}, customerId: ${createdCustomer._id.toString()}`,
          );
        } else {
          this.logger.log(
            `Welcome email queued successfully for ${createdCustomer.email}`,
          );
        }
      }

      return {
        error: false,
        message: 'success',
        status: 201,
        data: result as CustomerDocument,
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

  // async createByAdmin(createCustomerDto: CreateCustomerDto) {
  //   try {
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
  //   queryParams: QueryCustomerDto = {},
  //   options: FindAllOptions = {},
  // ) {
  //   try {
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
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  async findOne(filter: FilterQuery<Customer>) {
    return await this.customerModel.findOne(filter);
  }

  async findById(id: string | Types.ObjectId) {
    return await this.customerModel.findById(id);
  }

  async findByEmail(email: string) {
    return await this.customerModel.findOne({ email });
  }

  // For authentication (includes password)
  async findOneForAuth(filter: FilterQuery<Customer>) {
    return await this.customerModel.findOne(filter).select('+password'); // Include password only for auth
  }

  // async findOneAndUpdate(
  //   filter: FilterQuery<Customer>,
  //   updateCustomerDto: UpdateCustomerDto,
  // ) {
  //   try {
  //     // Create update object without mutating the DTO
  //     const updateData = {
  //       ...updateCustomerDto,
  //       updatedAt: new Date(),
  //     };
  //     // Hash password if being updated
  //     if (updateCustomerDto.password) {
  //       updateData.password = await this.bcryptService.hash(
  //         updateCustomerDto.password,
  //       );
  //     }
  //     const updatedDoc = await this.customerModel.findOneAndUpdate(
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

  async updateOne(
    filter: FilterQuery<Customer>,
    updateObject: UpdateQuery<Customer>,
  ) {
    try {
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
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

  // async updateMany(
  //   filter: FilterQuery<Customer>,
  //   updateCustomerDto: UpdateCustomerDto,
  // ) {
  //   try {
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
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async softDelete(filter: FilterQuery<Customer>) {
  //   try {
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
  //   } catch (err) {
  //     const { message, status } = getErrorData(err);
  //     return {
  //       error: true,
  //       message,
  //       status,
  //     };
  //   }
  // }

  // async hardDelete(filter: FilterQuery<Customer>) {
  //   try {
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
  //     const result = await this.customerModel.aggregate(pipeline).exec();
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
