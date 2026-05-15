import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { ProductStatus } from 'src/common/enums/status.enum';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, minLength: 2, maxLength: 50 })
  title: string;

  @Prop({ required: true, ref: 'Category' })
  category: mongoose.Schema.Types.ObjectId;

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
}

export const ProductSchema = SchemaFactory.createForClass(Product);
