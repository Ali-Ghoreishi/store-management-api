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
  IsMongoId,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  description: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @IsOptional()
  color: string;

  @IsNumber()
  @IsOptional()
  inventory: number;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  image: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  image_altText: string;
}
