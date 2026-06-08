// verify-account.dto.ts
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(5)
  verifyCode: string;
}
