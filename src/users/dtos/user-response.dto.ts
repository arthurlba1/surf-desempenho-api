import { Expose, plainToInstance } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsString } from 'class-validator';

import { UserRole } from '@/users/types/user-role.type';
import { User } from '@/users/schemas/user.schema';
import { ActiveSchool } from '../schemas/active-school.schema';

class UserResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  birthdate: string;

  @Expose()
  @IsString()
  document: string;

  @Expose()
  @IsString()
  profilePictureUrl: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;

  @Expose()
  @IsString()
  currentActiveSchoolId: string;

  activeSchools: ActiveSchool[];

  password: string

  createdAt: Date

  updatedAt: Date

  static fromEntity(entity: User): UserResponseDto {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: User[]): UserResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}

class UserResponseWithPasswordDto extends UserResponseDto {
  @Expose()
  declare password: string;
}

export { UserResponseDto, UserResponseWithPasswordDto };
