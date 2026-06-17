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
  Query,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import Res from 'src/common/helpers/response.helper';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { AuthUser } from 'src/common/types/global.type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ProductsService } from '../products.service';
import { AdminsService } from 'src/modules/admins/admins.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: ExpressRequest,
  ) {
    const result = await this.productsService.create(
      createProductDto,
      req.user as AuthUser,
    );
    return Res.created(result);
  }

  @Get()
  @Roles(Role.Admin, Role.Manager)
  async findAll(@Query() queryParams: QueryProductDto) {
    const result = await this.productsService.findAll(queryParams, {
      enablePopulate: true,
      populationFields: ['parent'],
    });
    return Res.ok(result.data);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Manager)
  async findOne(@Param('id') id: string) {
    const result = await this.productsService.findOne({ _id: id });
    if (result) return Res.ok(result);
  }
}
