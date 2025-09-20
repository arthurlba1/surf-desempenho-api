import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { UserRole } from '@/users/types/user-role.type';

export class RegisterDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The profile picture of the user',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture: string;

  @ApiProperty({
    description: 'The birth date of the user',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  birthDate: string;

  @ApiProperty({
    description: 'The document of the user',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  document: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'surfer',
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
