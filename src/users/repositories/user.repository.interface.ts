import { ClientSession } from 'mongoose';

import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { ActiveSchool } from '../schemas/active-school.schema';

export abstract class IUserRepository {
  abstract create(data: CreateUserDto, session?: ClientSession): Promise<UserResponseDto>;
  abstract findByEmail(email: string, session?: ClientSession): Promise<UserResponseDto | null>;
  abstract findById(id: string, session?: ClientSession): Promise<UserResponseDto | null>;
  abstract update(id: string, data: UpdateUserDto, session?: ClientSession): Promise<UserResponseDto | null>;
  abstract remove(id: string, session?: ClientSession): Promise<void>
  abstract setCurrentActiveSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<UserResponseDto | null>
  abstract updateActiveSchools(userId: string, activeSchool: ActiveSchool, session?: ClientSession): Promise<UserResponseDto | null>
}
