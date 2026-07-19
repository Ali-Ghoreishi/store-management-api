import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';

export class RegisterAuthDto {
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
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  password: string;

  @IsString()
  @Length(11, 11)
  @IsNotEmpty()
  phoneNumber: string;
}

export class RegisterAdminDto extends RegisterAuthDto {
  @IsEnum(Role)
  role: Role;
}

export class RegisterCustomerDto extends RegisterAuthDto {}
