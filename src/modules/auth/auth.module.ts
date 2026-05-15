import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminsModule } from '../admins/admins.module';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { CommonModule } from 'src/common/common.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [AdminsModule, CommonModule],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, JwtStrategy],
})
export class AuthModule {}
