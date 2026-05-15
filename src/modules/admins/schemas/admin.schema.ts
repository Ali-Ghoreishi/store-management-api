import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';

// export type AdminDocument = Admin & Document;
export type AdminDocument = HydratedDocument<Admin>;

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

  @Prop({ default: Role.Manager, enum: Object.values(Role) })
  role: Role;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date;

  @Prop({ required: false, default: false })
  deleted: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
