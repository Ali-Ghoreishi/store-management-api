// dto/query-admin.dto.ts
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  Min,
  Max,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { AdminDocument, AdminStatus } from '../schemas/admin.schema';
import { Role } from 'src/common/enums/roles.enum';

export class QueryAdminDto extends BaseQueryDto {
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  search?: string; // Search in firstName, lastName, email

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  firstName?: string;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(1)
  @MaxLength(11)
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  role?: Role;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  status?: AdminStatus;

  @IsOptional()
  @IsIn(['true', 'false'])
  deleted?: string;

  //   @IsOptional()
  //   @MinLength(1)
  //   @MaxLength(50)
  //   @IsString()
  //   fields?: string; // Comma-separated fields to return (e.g., "firstName,lastName,email")
}
