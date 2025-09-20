import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsString } from 'class-validator';

import { UserRole } from '@/users/types/user-role.type';
import { User } from '@/users/schemas/user.schema';

class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The name of the user',
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The birth date of the user',
  })
  @Expose()
  @IsString()
  birthDate: string;

  @ApiProperty({
    description: 'The document of the user',
  })
  @Expose()
  @IsString()
  document: string;

  @ApiProperty({
    description: 'The profile picture of the user',
  })
  @Expose()
  @IsString()
  profilePicture: string;

  @ApiProperty({
    description: 'The email of the user',
  })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The role of the user',
  })
  @Expose()
  @IsEnum(UserRole)
  role: UserRole;

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
  @ApiProperty({ description: 'The password of the user' })
  @Expose()
  declare password: string;
}

export { UserResponseDto, UserResponseWithPasswordDto };
