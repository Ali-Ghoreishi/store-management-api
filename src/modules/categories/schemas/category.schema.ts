import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

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
  parent: mongoose.Schema.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
