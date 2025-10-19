import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';

import {
  ApiGetLoggedUserDocumentation,
  ApiLoginDocumentation,
  ApiRegisterDocumentation
} from '@/auth/decorators/auth-swagger.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthResponseDto } from '@/auth/dtos/auth-response.dto';
import { RegisterDto } from '@/auth/dtos/register.dto';
import { LoginDto } from '@/auth/dtos/login.dto';
import { Public } from '@/auth/guards/public.guard';
import { RegisterSurferUseCase } from '@/auth/use-cases/register-surfer-use-case';
import { RegisterCoachUseCase } from '@/auth/use-cases/register-coach-use-case';
import { LoggedUseCase } from '@/auth/use-cases/logged-use-case';
import { LoginUseCase } from '@/auth/use-cases/login-use-case';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import type { AuthUser } from '@/common/types/auth.types';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { UserRole } from '@/users/types/user-role.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerCoachUseCase: RegisterCoachUseCase,
    private readonly registerSurferUseCase: RegisterSurferUseCase,
    private readonly loggedUseCase: LoggedUseCase
  ){}

  @Public()
  @Post('register')
  @ApiRegisterDocumentation()
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto<AuthResponseDto>> {
    if (registerDto.role === UserRole.COACH) {
      return await this.registerCoachUseCase.handle(registerDto)
    }
    if (registerDto.role === UserRole.SURFER) {
      return await this.registerSurferUseCase.handle(registerDto)
    }

    throw new BadRequestException('Invalid role');
  }

  @Public()
  @Post('login')
  @ApiLoginDocumentation()
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return await this.loginUseCase.handle(loginDto);
  }

  @Get('me')
  @ApiGetLoggedUserDocumentation()
  async getLoggedUser(@CurrentUser() user: AuthUser): Promise<ApiResponseDto<UserResponseDto>> {
    return await this.loggedUseCase.handle(undefined, user);
  }
}
