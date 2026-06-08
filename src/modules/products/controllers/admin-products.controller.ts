import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  HttpException,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { ProductsService } from '../products.service';
import { AdminsService } from 'src/modules/admins/admins.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { AuthUser } from 'src/common/types/global.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.productsService.create(
      createProductDto,
      req.user as AuthUser,
    );
  }

  // @Get()
  // async findAll(@Param listQueryParamsDto: ListQueryParamsDto) {
  //   try {
  //     return await this.productsService.findA(createProductDto);
  //   } catch (error) {
  //     return new HttpException(
  //       error.message || 'Internal server error',
  //       error.status || 500,
  //     );
  //   }
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   // return this.productsService.findOne(+id);
  //   return { message: 'success', status: 200, data: { id } };
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //   // return this.productsService.update(+id, updateProductDto);
  //   return { message: 'success', status: 200, data: { method: 'patch', id } };
  // }

  // @Patch('updateByAdmin/:id')
  // async updateByAdmin(
  //   @Param('id') id: string,
  //   @Body() updateProductDto: UpdateProductDto,
  // ) {
  //   const admin = await this.adminsService.findOne(1);
  //   return {
  //     message: 'success',
  //     status: 200,
  //     data: { controllerName: 'updateByAdmin', method: 'patch', id, admin },
  //   };
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productsService.remove(+id);
  // }
}
