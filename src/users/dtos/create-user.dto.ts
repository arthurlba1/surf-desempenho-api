import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The profile picture of the user',
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiProperty({
    description: 'The birth date of the user',
    example: '1990-01-01',
  })
  @IsString()
  @IsOptional()
  birthDate: string;

  @ApiProperty({
    description: 'The document of the user',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  document: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'surfer',
  })
  @IsNotEmpty()
  role: string;
}
