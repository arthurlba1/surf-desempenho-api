import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@/auth/auth.controller';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { RegisterUseCase } from '@/auth/application/commands/register.use-case';
import { RegisterSurferUseCase } from '@/auth/application/commands/register-surfer.use-case';
import { RegisterCoachUseCase } from '@/auth/application/commands/register-coach.use-case';
import { SwitchActiveSchoolUseCase } from '@/auth/application/commands/switch-active-school.use-case';
import { GetLoggedUserUseCase } from '@/auth/application/queries/get-logged-user.use-case';
import { LoginUseCase } from '@/auth/application/queries/login.use-case';
import { IdentityModule } from '@/identity/identity.module';
import { SchoolModule } from '@/school/school.module';
import { SchoolContextGuard } from '@/auth/guards/school-context.guard';

@Module({
  imports: [
    IdentityModule,
    SchoolModule,
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
  providers: [
    JwtStrategy,
    GetLoggedUserUseCase,
    LoginUseCase,
    RegisterUseCase,
    RegisterSurferUseCase,
    RegisterCoachUseCase,
    SwitchActiveSchoolUseCase,
    SchoolContextGuard,
  ],
  exports: [SchoolContextGuard],
})
export class AuthModule {}
