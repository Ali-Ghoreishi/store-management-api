import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from 'src/modules/admins/admins.service';
import { Role } from 'src/common/enums/roles.enum';
import { AuthUser } from 'src/common/types/global.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminService: AdminsService,
  ) {
    const secret = configService.getOrThrow<string>('auth.accessSecret');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: Role;
  }): Promise<AuthUser> {
    try {
      if (!payload.sub || !payload.email || !payload.role) {
        throw new UnauthorizedException('Invalid token payload');
      }
      if ([Role.Admin, Role.Manager].includes(payload.role)) {
        const admin = await this.adminService.findOne({
          _id: payload.sub,
          email: payload.email,
        });
        if (!admin) throw new UnauthorizedException('Invalid token payload');
        if (admin.deleted)
          throw new UnauthorizedException('Invalid token payload');
      }
      if (payload.role == Role.Customer) {
        //TBC
      }
      return {
        _id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (err) {
      throw new HttpException(
        err.message,
        err instanceof HttpException ? err.getStatus() : err.status || 500,
      );
    }
  }
}
