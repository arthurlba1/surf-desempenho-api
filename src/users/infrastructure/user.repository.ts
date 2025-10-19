import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { User, UserDocument } from '@/users/schemas/user.schema';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { ActiveSchool } from '../schemas/active-school.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: CreateUserDto, session?: ClientSession): Promise<UserResponseDto> {
    const user = new this.userModel(data);
    return UserResponseDto.fromEntity(await user.save({ session }));
  }

  async findByEmail(email: string, session?: ClientSession): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ email }, null, { session }).exec();
    return user ? UserResponseDto.fromEntity(user) : null;
  }

  async findById(id: string, session?: ClientSession): Promise<UserResponseDto | null> {
    const user = await this.userModel.findById(id, null, { session }).exec();
    return user ? UserResponseDto.fromEntity(user) : null;
  }

  async update(id: string, data: UpdateUserDto, session?: ClientSession): Promise<UserResponseDto | null> {
    const user = await this.userModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
    return user ? UserResponseDto.fromEntity(user) : null;
  }

  async remove(id: string, session?: ClientSession): Promise<void> {
    await this.userModel.findByIdAndDelete(id, { session }).exec();
  }

  async setCurrentActiveSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<UserResponseDto | null> {
    const user = await this.userModel.findByIdAndUpdate(userId, { currentActiveSchoolId: schoolId }, { new: true, session }).exec();
    return user ? UserResponseDto.fromEntity(user) : null;
  }

  async updateActiveSchools(userId: string, activeSchool: ActiveSchool, session?: ClientSession): Promise<UserResponseDto | null> {
    const user = await this.userModel.findById(userId, null, { session }).exec();
    if (!user) return null;

    const activeSchoolItem = user.activeSchools.find(school => school.schoolId === activeSchool.schoolId);

    if (activeSchoolItem) {
      activeSchoolItem.isActive = activeSchool.isActive;
      activeSchoolItem.role = activeSchool.role;
    } else {
      user.activeSchools.push(activeSchool);
    }

    await user.save({ session });

    return UserResponseDto.fromEntity(user);
  }
}
