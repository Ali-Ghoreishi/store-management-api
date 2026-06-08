import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { getErrorData } from 'src/common/helpers/error.helper';
import Res from 'src/common/helpers/response.helper';
import { AuthUser } from 'src/common/types/global.type';
import { QueryCategoryDto } from './dto/query-category.dto';
import { FindAllOptions } from 'src/common/types/find-all-options.interface';
import { buildFilters } from 'src/common/helpers/build-filters.helper';
import { getPaginationOptions } from 'src/common/helpers/pagination.helper';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: AuthUser) {
    try {
      const duplicateTitle = await this.categoryModel.findOne({
        title: createCategoryDto.title,
      });
      if (duplicateTitle) {
        return Res.error('Title already exists.', 400);
      }
      const categoryData = {
        ...createCategoryDto,
        createdBy: user._id,
      };
      const createdCategory = new this.categoryModel(categoryData);
      return await createdCategory.save();
    } catch (err) {
      const { message, status } = getErrorData(err);
      return Res.error(message, status);
    }
  }

  async findAll(
    queryParams: QueryCategoryDto = {},
    options: FindAllOptions = {},
  ) {
    try {
      const {
        treeView,
        enablePopulate = true,
        populationFields = ['parent'],
      } = options;
      // Build filters with proper typing
      const filters: FilterQuery<Category> = buildFilters<Category>(
        queryParams,
        {
          searchFields: ['title'],
          exactMatchFields: ['title'],
          searchTerm: 'search',
          caseSensitive: false,
          customFilters: {
            // deleted: (value) => value === 'true', // convert string to boolean
            // minAge: (value) => ({ $gte: parseInt(value) }),
            // maxAge: (value) => ({ $lte: parseInt(value) }),
            // isActive: (value) => value === 'true',
          },
        },
      );

      // Get pagination options
      const { skip, limit, sort, page } = getPaginationOptions(queryParams);

      if (treeView) {
        const allCategories = await this.categoryModel
          .find(filters)
          .sort(sort)
          .lean();

        const categoryMap = new Map();
        allCategories.forEach((category) => {
          categoryMap.set(category._id.toString(), {
            ...category,
            children: [],
          });
        });
        const roots: CategoryDocument[] = [];
        for (const category of categoryMap.values()) {
          if (category.parent) {
            const parent = categoryMap.get(category.parent.toString());

            if (parent) {
              parent.children.push(category);
            }
          } else {
            roots.push(category);
          }
        }
        const total = roots.length;
        const paginatedRoots = roots.slice(skip, skip + limit);
        return {
          error: false,
          message: 'success',
          status: 200,
          data: {
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
            result: paginatedRoots,
          },
        };
      }

      // Build query with population
      let query = this.categoryModel
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Apply population if enabled
      // if (enablePopulate) {
      //   populationFields.forEach((field) => {
      //     switch (field) {
      //       case 'parent':
      //         query = query.populate('parent', 'title');
      //         break;
      //       default:
      //         query = query.populate(field);
      //     }
      //   });
      // }

      const [data, total] = await Promise.all([
        query.exec(),
        this.categoryModel.countDocuments(filters).exec(),
      ]);

      return {
        error: false,
        message: 'success',
        status: 200,
        data: {
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          result: data,
        },
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      return {
        error: true,
        message,
        status,
      };
    }
  }

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
