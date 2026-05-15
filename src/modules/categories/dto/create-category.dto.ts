import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
} from 'class-validator';

import { Types } from 'mongoose';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  title: string;

  @IsMongoId({ message: 'parent must be a valid MongoDB ObjectId' })
  @IsOptional()
  parent: Types.ObjectId | null;
}
