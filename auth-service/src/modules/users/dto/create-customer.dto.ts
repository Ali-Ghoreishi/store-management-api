import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Length,
  IsIn,
  IsNumber,
} from 'class-validator';
import { UserStatus } from '../schemas/user.schema';

// Base DTO with common customer fields
export class BaseCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(11, 11)
  @IsNotEmpty()
  phoneNumber: string;
}

// DTO for customer self-registration
export class CreateCustomerDto extends BaseCustomerDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  password: string;
}

// Extended DTO for admin creation with additional fields
export class AdminCreateCustomerDto extends BaseCustomerDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsOptional()
  password: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsNumber()
  @IsOptional()
  walletBalance?: number;
}
