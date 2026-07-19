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
// import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { RabbitMQService } from '../../common/modules/rabbitmq/rabbitmq.service';
import { RabbitMQServices } from '../../common/modules/rabbitmq/constants/services';
import { RabbitMQEvents } from '../../common/modules/rabbitmq/constants/events';
import Helper from 'src/utils/helpers';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly bcryptService: BcryptService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async registerSelf(createCustomerDto: CreateCustomerDto) {
    const verifyCode = Helper.generateRandomCode(5);
    // 1. Check for duplicate email
    const duplicateEmail = await this.findByEmail(createCustomerDto.email);
    if (duplicateEmail) {
      throw new BadRequestException('User already exists.');
    }
    // 2. Hash password
    const hashedPassword = await this.bcryptService.hash(
      createCustomerDto.password,
    );
    createCustomerDto.password = hashedPassword;
    const createdUser = new this.userModel({
      ...createCustomerDto,
      emailVerify: {
        code: verifyCode,
        lastRequestTime: new Date(),
        attempts: 1,
      },
    });
    await createdUser.save();
    const { password, emailVerify, ...result } = createdUser.toObject();

    // Send welcome email via RabbitMQ
    {
      this.rabbitMQService.emit(
        RabbitMQServices.EMAIL,
        RabbitMQEvents.EMAIL_WELCOME_USER,
        {
          email: createdUser.email,
          userId: createdUser._id.toString(),
          name: 'testUser', //TBC
          timestamp: new Date(),
        },
      );
    }

    // Send Verify Account Code via RabbitMQ
    {
      this.rabbitMQService.emit(
        RabbitMQServices.EMAIL,
        RabbitMQEvents.EMAIL_VERIFY_ACCOUNT,
        {
          email: createdUser.email,
          code: verifyCode,
          name: 'testUser', //TBC
          timestamp: new Date(),
        },
      );
    }

    // save customer in user-service db
    {
      this.rabbitMQService.emit(
        RabbitMQServices.USER,
        RabbitMQEvents.USER_CREATED,
        {
          ...createCustomerDto,
          password: hashedPassword,
        },
      );
    }

    return {
      message: 'success',
      data: result as UserDocument,
    };
  }

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
}
