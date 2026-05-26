import { AdminDocument } from './../../admins/schemas/admin.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';
import {
  EmailVerification,
  EmailVerificationDefault,
} from 'src/common/schemas/email-verification.schema';

// export type CustomerDocument = Customer & Document;
export type CustomerDocument = HydratedDocument<Customer>;

export enum CustomerStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  // Banned = 'banned',
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

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

  @Prop({ default: Role.Customer, enum: [Role.Customer] })
  role: Role;

  @Prop({ default: 0, min: 0, type: Number })
  walletBalance: number;

  @Prop({ default: CustomerStatus.Active, enum: CustomerStatus })
  status: CustomerStatus;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: false, default: null })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: false, default: null })
  updatedBy: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
