import { Controller, Put, Body } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { UpdateUserInformationsUseCase } from '@/users/use-cases/update-user-informations-use-case';
import { UserResponseDto } from '@/users/dtos/user-response.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly updateUserInformationsUseCase: UpdateUserInformationsUseCase) {}

  @Put()
  async update(@CurrentUser() authUser: AuthUser, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    return await this.updateUserInformationsUseCase.handle(updateUserDto, authUser);
  }
}
