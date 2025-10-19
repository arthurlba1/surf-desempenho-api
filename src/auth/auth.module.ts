import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@/auth/auth.controller';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { RegisterSurferUseCase } from '@/auth/use-cases/register-surfer-use-case';
import { RegisterCoachUseCase } from '@/auth/use-cases/register-coach-use-case';
import { LoggedUseCase } from '@/auth/use-cases/logged-use-case';
import { LoginUseCase } from '@/auth/use-cases/login-use-case';
import { UsersModule } from '@/users/users.module';
import { SchoolModule } from '@/school/school.module';
import { MembershipsModule } from '@/memberships/memberships.module';

@Module({
  imports: [
    UsersModule,
    SchoolModule,
    MembershipsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, LoggedUseCase, LoginUseCase, RegisterSurferUseCase, RegisterCoachUseCase],
  exports: [],
})
export class AuthModule {}
