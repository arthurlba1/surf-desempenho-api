import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from '@/auth/types/auth.type';
import type { AuthUser } from '@/common/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const authUser: AuthUser = {
      id: payload.id,
      currentActiveSchoolId: payload.currentActiveSchoolId,
      email: payload.email,
    };
    return authUser;
  }
}
