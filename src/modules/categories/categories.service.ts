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
    const duplicateTitle = await this.categoryModel.findOne({
      title: createCategoryDto.title,
    });
    if (duplicateTitle) {
      throw Res.error('Title already exists.', 400);
    }
    const categoryData = {
      ...createCategoryDto,
      createdBy: user._id,
    };
    const createdCategory = new this.categoryModel(categoryData);
    return await createdCategory.save();
  }

  async findAll(
    queryParams: QueryCategoryDto = {},
    options: FindAllOptions = {},
  ) {
    const {
      treeView,
      enablePopulate = true,
      populationFields = ['parent'],
    } = options;
    // Build filters with proper typing
    const filters: FilterQuery<Category> = buildFilters<Category>(queryParams, {
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
    });

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
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: paginatedRoots,
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
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }
}
