import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminsModule } from 'src/modules/admins/admins.module';

@Module({
  imports: [AdminsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
