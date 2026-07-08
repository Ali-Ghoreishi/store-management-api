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
import { PartialType, PickType } from '@nestjs/mapped-types';
import {
  CreateCustomerDto,
  AdminCreateCustomerDto,
} from './create-customer.dto';

export class UpdateCustomerDto extends PickType(CreateCustomerDto, [
  'firstName',
  'lastName',
  'phoneNumber',
] as const) {
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  password?: string;
}

export class AdminUpdateCustomerDto extends PartialType(
  AdminCreateCustomerDto,
) {
  // @IsString()
  // @IsOptional()
  // adminNotes?: string;
}
