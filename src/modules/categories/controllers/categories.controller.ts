import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { AuthUser } from 'src/common/types/global.type';
import Res from 'src/common/helpers/response.helper';
// import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindAllOptions } from 'src/common/types/find-all-options.interface';
import { QueryCategoryDto } from '../dto/query-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() queryParams: QueryCategoryDto) {
    const result = await this.categoriesService.findAll(queryParams, {
      treeView: true,
      enablePopulate: true,
      populationFields: ['parent'],
    });
    if (result.error) throw Res.error(result.message, result.status);
    else return Res.ok(result.data, result.message);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const category = await this.categoriesService.findById(id);
      if (!category) return new HttpException('Data not found.', 404);
      return category;
    } catch (error) {
      return new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }
}
