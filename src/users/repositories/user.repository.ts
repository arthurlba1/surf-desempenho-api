import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '@/users/schemas/user.schema';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(data: CreateUserDto) {
    const user = new this.userModel(data);
    return user.save();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  update(email: string, data: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(email, data, { new: true }).exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
