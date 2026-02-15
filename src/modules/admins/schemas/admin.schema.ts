import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';

export type AdminDocument = Admin & Document;

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

  @Prop({ default: Role.Manager, enum: Object.values(Role), required: true })
  role: Role;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
