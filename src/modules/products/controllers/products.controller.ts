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
  Query,
} from '@nestjs/common';
import { ProductsService } from '../products.service';
import { QueryProductDto } from '../dto/query-product.dto';
import Res from 'src/common/helpers/response.helper';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() queryParams: QueryProductDto) {
    const result = await this.productsService.findAll(queryParams, {
      enablePopulate: true,
      populationFields: ['category'],
    });
    if (result.error) throw Res.error(result.message, result.status);
    else return Res.ok(result.data, result.message);
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   try {
  //     const category = await this.categoriesService.findById(id);
  //     if (!category) return new HttpException('Data not found.', 404);
  //     return category;
  //   } catch (error) {
  //     return new HttpException(
  //       error.message || 'Internal server error',
  //       error.status || 500,
  //     );
  //   }
  // }
}
