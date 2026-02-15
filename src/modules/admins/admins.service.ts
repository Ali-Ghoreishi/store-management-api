import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name)
    private adminModel: Model<AdminDocument>,
  ) {}

  create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const createdAdmin = new this.adminModel(createAdminDto);
    return createdAdmin.save();
  }

  findAll() {
    return this.adminModel.find().exec();
  }

  async findOne(id: number) {
    // return this.adminModel.findById(id); // returns a Promise
    return `This action returns a #${id} admin`;
  }

  // async findByEmail(email: string): Promise<Admin | null> {
  //   return this.adminModel.findOne({ email }).exec();
  // }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
