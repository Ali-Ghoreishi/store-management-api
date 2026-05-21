import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';

// export type AdminDocument = Admin & Document;
export type AdminDocument = HydratedDocument<Admin>;

export enum AdminStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  // Banned = 'banned',
}

@Schema({ timestamps: true })
export class Admin {
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

  @Prop({ default: Role.Manager, enum: [Role.Admin, Role.Manager] })
  role: Role;

  @Prop({ default: AdminStatus.Active, enum: AdminStatus })
  status: AdminStatus;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
