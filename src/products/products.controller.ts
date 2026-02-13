import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AdminsService } from 'src/admins/admins.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly adminsService: AdminsService,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    // return this.productsService.create(createProductDto);
    return {
      message: 'success',
      status: 200,
      data: { title: createProductDto.title },
    };
  }

  @Get()
  findAll() {
    // return this.productsService.findAll();
    return { message: 'success', status: 200, data: ['pr1', 'pr2', 'pr3'] };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.productsService.findOne(+id);
    return { message: 'success', status: 200, data: { id } };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // return this.productsService.update(+id, updateProductDto);
    return { message: 'success', status: 200, data: { method: 'patch', id } };
  }

  @Patch('updateByAdmin/:id')
  async updateByAdmin(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const admin = await this.adminsService.findOne(1);
    return {
      message: 'success',
      status: 200,
      data: { controllerName: 'updateByAdmin', method: 'patch', id, admin },
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
