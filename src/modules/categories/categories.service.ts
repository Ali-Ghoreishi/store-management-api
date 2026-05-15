import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const duplicateTitle = await this.categoryModel.findOne({
      title: createCategoryDto.title,
    });
    if (duplicateTitle) {
      throw new HttpException('Title already exists.', 400);
    }
    const createdCategory = new this.categoryModel(createCategoryDto);
    return await createdCategory.save();
  }

  // findAll() {
  //   return `This action returns all categories`;
  // }

  async findOne(query: object) {
    return await this.categoryModel.findOne(query);
  }

  async findById(id: string /* , populates */) {
    return await this.categoryModel.findById(id); //.populate(populates);
  }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} category`;
  // }
}
