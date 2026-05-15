import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  password: string;
}

export class LoginAdminDto extends LoginAuthDto {}
export class LoginCustomerDto extends LoginAuthDto {}
