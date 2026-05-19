import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';

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

  @Prop({ select: false, required: true })
  password: string;

  @Prop({ required: true, length: 11 })
  phoneNumber: string;

  @Prop({ default: Role.Customer, enum: [Role.Customer] })
  role: Role;

  @Prop({ default: 0, min: 0, type: Number })
  walletBalance: number;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;

  @Prop({ default: CustomerStatus.Active, enum: CustomerStatus })
  status: CustomerStatus;

  @Prop({ default: false })
  deleted: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
