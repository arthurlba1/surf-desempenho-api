import { ClientSession } from 'mongoose';

import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { UserDocument } from '@/users/schemas/user.schema';

export abstract class IUserRepository {
  abstract create(data: CreateUserDto, session?: ClientSession): Promise<UserDocument>;
  abstract findByEmail(email: string, session?: ClientSession): Promise<UserDocument | null>;
  abstract findById(id: string, session?: ClientSession): Promise<UserDocument | null>;
  abstract update(id: string, data: UpdateUserDto, session?: ClientSession): Promise<UserDocument | null>;
  abstract remove(id: string, session?: ClientSession): Promise<void>
  abstract setCurrentActiveSchoolId(userId: string, schoolId: string, session?: ClientSession): Promise<UserDocument | null>
}
