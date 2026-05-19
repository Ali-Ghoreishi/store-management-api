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
} from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn(['password', 'otp'])
  loginType: 'password' | 'otp';

  @IsOptional()
  @IsString()
  @Length(6, 6)
  code?: string;
}

export class LoginAdminDto extends LoginAuthDto {}
export class LoginCustomerDto extends LoginAuthDto {}
