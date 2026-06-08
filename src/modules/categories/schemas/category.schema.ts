import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, minLength: 2, maxLength: 50 })
  title: string;

  @Prop({
    required: false,
    ref: 'Category',
    default: null,
  })
  parent: Types.ObjectId;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: false, default: null })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: false, default: null })
  updatedBy: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
