import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { User, UserDocument } from '@/users/schemas/user.schema';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { IUserRepository } from '@/users/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: CreateUserDto, session?: ClientSession): Promise<UserDocument> {
    const user = new this.userModel(data);
    return await user.save({ session });
  }

  async findByEmail(email: string, session?: ClientSession): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email }, null, { session }).exec();
    return user || null;
  }

  async findById(id: string, session?: ClientSession): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id, null, { session }).exec();
    return user || null;
  }

  async update(id: string, data: UpdateUserDto, session?: ClientSession): Promise<UserDocument | null> {
    const user = await this.userModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
    return user || null;
  }

  async remove(id: string, session?: ClientSession): Promise<void> {
    await this.userModel.findByIdAndDelete(id, { session }).exec();
  }

  async setCurrentActiveSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<UserDocument | null> {
    const user = await this.userModel.findByIdAndUpdate(userId, { currentActiveSchoolId: schoolId }, { new: true, session }).exec();
    return user || null;
  }
}
