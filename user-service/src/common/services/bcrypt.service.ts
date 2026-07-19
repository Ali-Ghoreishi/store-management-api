import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
  constructor(private readonly configService: ConfigService) {}

  async hash(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds', 10);
    return bcrypt.hash(password, saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
