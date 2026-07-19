import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, minLength: 2, maxLength: 50 })
  title: string;

  @Prop({ required: true, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ required: false, minLength: 2, maxLength: 200, default: null })
  description: string;

  @Prop({ required: true, minLength: 2, maxLength: 20 })
  color: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false, max: 500, default: 0 })
  inventory: number;

  @Prop({
    enum: Object.values(ProductStatus),
    required: false,
    default: ProductStatus.Active,
  })
  status: string;

  @Prop({ required: false, maxLength: 100, default: null })
  image: string; // url

  @Prop({ required: false, minLength: 2, maxLength: 50, default: null })
  image_altText: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: false, default: null })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: false, default: null })
  updatedBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
