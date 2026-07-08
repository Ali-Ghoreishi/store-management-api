import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';
import {
  EmailVerification,
  EmailVerificationDefault,
} from 'src/common/schemas/email-verification.schema';

export type UserDocument = HydratedDocument<User>;

export enum UserType {
  Admin = 'Admin',
  Customer = 'Customer',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  // Banned = 'banned',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: EmailVerification,
    required: false,
    select: false,
    default: EmailVerificationDefault,
  })
  emailVerify: EmailVerification;

  @Prop({ select: false, required: true })
  password: string;

  @Prop({ required: true, length: 11 })
  phoneNumber: string;

  @Prop({ default: Role.Customer, enum: Role })
  role: Role;

  @Prop({ default: UserType.Customer, enum: UserType })
  userType: UserType;

  @Prop({ default: UserStatus.Active, enum: UserStatus })
  status: UserStatus;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
