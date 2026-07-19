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
import { CategoryDocument } from '../schemas/category.schema';

export class QueryCategoryDto extends BaseQueryDto {
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  search?: string; // Search in firstName, lastName, email

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  title?: string;

  //   @IsOptional()
  //   @MinLength(1)
  //   @MaxLength(50)
  //   @IsString()
  //   fields?: string; // Comma-separated fields to return (e.g., "firstName,lastName,email")
}
