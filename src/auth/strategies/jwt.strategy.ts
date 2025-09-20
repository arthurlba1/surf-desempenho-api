import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '@/users/users.service';
import { UserAuthResponseDto } from '@/auth/dtos/auth-response.dto';
import { UserResponseDto } from '@/users/dtos/user-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: UserAuthResponseDto): Promise<UserResponseDto> {
    const user = await this.usersService.findById(payload.id);

    return UserResponseDto.fromEntity(user);
  }
}
