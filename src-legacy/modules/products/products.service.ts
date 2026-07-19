import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, ProjectionType } from 'mongoose';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { AuthUser } from 'src/common/types/global.type';
import Res from 'src/common/helpers/response.helper';
import { getErrorData } from 'src/common/helpers/error.helper';
import { QueryProductDto } from './dto/query-product.dto';
import { FindAllOptions } from 'src/common/types/find-all-options.interface';
import { buildFilters } from 'src/common/helpers/build-filters.helper';
import { getPaginationOptions } from 'src/common/helpers/pagination.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, user: AuthUser) {
    const duplicateTitle = await this.productModel.findOne({
      title: createProductDto.title,
    });
    if (duplicateTitle) {
      throw new BadRequestException('Title already exists.');
    }
    const productData = {
      ...createProductDto,
      createdBy: user._id,
    };
    const createdProduct = new this.productModel(productData);
    return await createdProduct.save();
  }

  async findAll(
    queryParams: QueryProductDto = {},
    options: FindAllOptions = {},
  ) {
    const { enablePopulate = true, populationFields = ['category'] } = options;
    // Build filters with proper typing
    const filters: FilterQuery<Product> = buildFilters<Product>(queryParams, {
      searchFields: ['title'],
      exactMatchFields: ['title'],
      searchTerm: 'search',
      caseSensitive: false,
      customFilters: {
        // deleted: (value) => value === 'true', // convert string to boolean
      },
    });

    // Get pagination options
    const { skip, limit, sort, page } = getPaginationOptions(queryParams);

    // Build query with population
    let query = this.productModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Apply population if enabled
    if (enablePopulate) {
      populationFields.forEach((field) => {
        switch (field) {
          case 'category':
            query = query.populate('category', 'title');
            break;
          default:
            query = query.populate(field);
        }
      });
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.productModel.countDocuments(filters).exec(),
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

  async findOne(
    filter: FilterQuery<Product>,
    projection?: ProjectionType<Product>,
    options?: QueryOptions<Product>,
  ) {
    return await this.productModel.findOne(filter, projection, options).exec();
  }
}
