import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { AuthUser } from 'src/common/types/global.type';
// import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.categoriesService.create(
      createCategoryDto,
      req.user as AuthUser,
    );
  }

  // @Get()
  // findAll() {
  //   return this.categoriesService.findAll();
  // }

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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
  //   return this.categoriesService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(+id);
  // }
}
