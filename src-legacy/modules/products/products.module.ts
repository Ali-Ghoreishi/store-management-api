import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './controllers/products.controller';
import { AdminsModule } from 'src/modules/admins/admins.module';
import { AdminProductsController } from './controllers/admin-products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AdminsModule,
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
