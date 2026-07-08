import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from 'src/modules/users/schemas/user.schema';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateUserToken(user: UserDocument): {
    accessToken: string;
    refreshToken?: string;
  } {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.accessSecret'),
      expiresIn: this.configService.get('auth.accessExpiresIn', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.refreshSecret'),
      expiresIn: this.configService.get('auth.refreshExpiresIn', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
