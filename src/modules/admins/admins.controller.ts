import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import Res from '../../common/helpers/response.helper';
import { getErrorData } from 'src/common/helpers/error.helper';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ConfigService } from '@nestjs/config';
import { QueryAdminDto } from './dto/query-admin.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';

@Controller('admins')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() queryParams: QueryAdminDto) {
    const result = await this.adminsService.findAll(queryParams);
    if (result) return Res.ok(result.data);
  }
}
