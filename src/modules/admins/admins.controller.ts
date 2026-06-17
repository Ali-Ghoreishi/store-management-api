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

import Res from 'src/common/helpers/response.helper';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ConfigService } from '@nestjs/config';
import { QueryAdminDto } from './dto/query-admin.dto';

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Roles(Role.Admin, Role.Manager)
  async findAll(@Query() queryParams: QueryAdminDto) {
    const result = await this.adminsService.findAll(queryParams);
    if (result) return Res.ok(result);
  }
}
