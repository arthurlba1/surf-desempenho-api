import { ApiProperty } from '@nestjs/swagger';
import { LoggedUserResponse } from './logged-user.response';

export class AuthResponse {
  @ApiProperty({ description: 'JWT access token for authentication' })
  access_token: string;

  @ApiProperty({ type: () => LoggedUserResponse, description: 'Authenticated user data' })
  user: LoggedUserResponse;

  static from(token: string, user: LoggedUserResponse): AuthResponse {
    return {
      access_token: token,
      user,
    };
  }
}
