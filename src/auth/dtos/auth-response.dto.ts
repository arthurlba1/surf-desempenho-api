import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';

export class AuthResponseDto {
  @ApiProperty({ 
    description: 'The JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @Expose()
  accessToken: string;

  static fromToken(token: string): AuthResponseDto {
    return plainToInstance(AuthResponseDto, { accessToken: token }, {
      excludeExtraneousValues: true,
    });
  }
}

export class UserAuthResponseDto {
  @ApiProperty({ 
    description: 'The unique identifier of the user'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The email of the user'
  })
  @Expose()
  email: string;
}
