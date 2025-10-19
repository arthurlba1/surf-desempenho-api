import { Expose, plainToInstance } from 'class-transformer';

/* from user entity to auth response dto */
export class AuthResponseDto {
  @Expose()
  accessToken: string;

  static fromToken(token: string): AuthResponseDto {
    return plainToInstance(AuthResponseDto, { accessToken: token }, {
      excludeExtraneousValues: true,
    });
  }
}
