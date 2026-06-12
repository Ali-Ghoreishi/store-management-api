import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model /* QueryFilter */ } from 'mongoose';

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
    try {
      const duplicateTitle = await this.productModel.findOne({
        title: createProductDto.title,
      });
      if (duplicateTitle) {
        throw Res.error('Title already exists.', 400);
      }
      const productData = {
        ...createProductDto,
        createdBy: user._id,
      };
      const createdProduct = new this.productModel(productData);
      return await createdProduct.save();
    } catch (err) {
      const { message, status } = getErrorData(err);
      throw Res.error(message, status);
    }
  }

  async findAll(
    queryParams: QueryProductDto = {},
    options: FindAllOptions = {},
  ) {
    try {
      const { enablePopulate = true, populationFields = ['category'] } =
        options;
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

  // findOne(id: number) {
  //   return `This action returns a #${id} product`;
  // }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
