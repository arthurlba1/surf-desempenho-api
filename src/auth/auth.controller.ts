import { Controller, Post, Body, Get, Patch } from '@nestjs/common';

import {
  ApiGetLoggedUserDocumentation,
  ApiLoginDocumentation,
  ApiRegisterDocumentation
} from '@/auth/decorators/auth-swagger.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthResponse } from '@/auth/application/responses/auth.response';
import { RegisterCommand } from '@/auth/application/commands/register.command';
import { LoginQuery } from '@/auth/application/queries/login.query';
import { Public } from '@/auth/guards/public.guard';
import { RegisterUseCase } from '@/auth/application/commands/register.use-case';
import { GetLoggedUserUseCase } from '@/auth/application/queries/get-logged-user.use-case';
import { LoginUseCase } from '@/auth/application/queries/login.use-case';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import type { AuthUser } from '@/common/types/auth.types';
import { LoggedUserResponse } from '@/auth/application/responses/logged-user.response';
import { SwitchActiveSchoolCommand } from '@/auth/application/commands/switch-active-school.command';
import { SwitchActiveSchoolUseCase } from '@/auth/application/commands/switch-active-school.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly getLoggedUserUseCase: GetLoggedUserUseCase,
    private readonly switchActiveSchoolUseCase: SwitchActiveSchoolUseCase,
  ){}

  @Public()
  @Post('register')
  @ApiRegisterDocumentation()
  async register(@Body() command: RegisterCommand): Promise<ApiResponseDto<AuthResponse>> {
    return await this.registerUseCase.handle(command);
  }

  @Public()
  @Post('login')
  @ApiLoginDocumentation()
  async login(@Body() query: LoginQuery): Promise<ApiResponseDto<AuthResponse>> {
    return await this.loginUseCase.handle(query);
  }

  @Get('me')
  @ApiGetLoggedUserDocumentation()
  async getLoggedUser(@CurrentUser() user: AuthUser): Promise<ApiResponseDto<LoggedUserResponse>> {
    return await this.getLoggedUserUseCase.handle(undefined, user);
  }

  @Patch('me/active-school')
  async switchActiveSchool(
    @Body() command: SwitchActiveSchoolCommand,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponseDto<AuthResponse>> {
    return await this.switchActiveSchoolUseCase.handle(command, user);
  }
}
