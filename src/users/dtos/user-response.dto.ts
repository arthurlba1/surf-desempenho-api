import { Expose, plainToInstance, Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator';

import { ActiveSchoolResponseDto } from '@/users/dtos/active-school-response.dto';
import { UserRole } from '@/users/types/user-role.type';
import { User } from '@/users/schemas/user.schema';

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

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActiveSchoolResponseDto)
  activeSchools: ActiveSchoolResponseDto[];

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
