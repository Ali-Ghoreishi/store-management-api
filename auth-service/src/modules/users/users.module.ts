import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UsersService } from './users.service';
// import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { BcryptService } from 'src/common/services/bcrypt.service';

@Module({
  imports: [
    // CommonModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [],
  providers: [UsersService, BcryptService],
  exports: [UsersService],
})
export class UsersModule {}
