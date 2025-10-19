import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

import { UserRole } from '@/users/types/user-role.type';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
  role: UserRole;

  @IsOptional()
  @IsString()
  profilePictureUrl: string;

  @IsOptional()
  @IsString()
  birthdate: string;

  @IsOptional()
  @IsString()
  document: string;
}
