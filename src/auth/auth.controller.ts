import { Controller, Post, Body, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '@/auth/auth.service';
import { RegisterDto } from '@/auth/dtos/register.dto';
import { LoginDto } from '@/auth/dtos/login.dto';
import { Public } from '@/auth/guards/public.guard';
import {
  ApiGetLoggedUserDocumentation,
  ApiLoginDocumentation,
  ApiRegisterDocumentation
} from '@/auth/decorators/auth-swagger.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiRegisterDocumentation()
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return {
      data: await this.authService.register(registerDto),
      message: 'User registered successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Public()
  @Post('login')
  @ApiLoginDocumentation()
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return {
      data: await this.authService.login(loginDto),
      message: 'User logged in successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('me')
  @ApiGetLoggedUserDocumentation()
  async getLoggedUser(@CurrentUser() user: UserResponseDto): Promise<ApiResponseDto<UserResponseDto>> {
    return {
      data: await this.authService.findLoggedUser(user.id),
      message: 'User profile fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }
} 