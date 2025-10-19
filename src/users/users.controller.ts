import { Controller, Put, Body, Post } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { AssociateUserToSchoolDto } from '@/users/dtos/associate-user-to-school.dto';
import { AssociateUserToSchoolUseCase } from '@/users/use-cases/associate-user-to-school-user-case';
import { UpdateUserInformationsUseCase } from '@/users/use-cases/update-user-informations-use-case';
import { UserResponseDto } from '@/users/dtos/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly associateUserSurferToSchoolUseCase: AssociateUserToSchoolUseCase,
    private readonly updateUserInformationsUseCase: UpdateUserInformationsUseCase
  ) {}

  @Put()
  async update(@CurrentUser() authUser: AuthUser, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    return await this.updateUserInformationsUseCase.handle(updateUserDto, authUser);
  }

  @Post('associate-surfer-to-school')
  async associateSurferToSchool(@CurrentUser() authUser: AuthUser, @Body() associateUserDto: AssociateUserToSchoolDto): Promise<ApiResponseDto<UserResponseDto>> {
    return await this.associateUserSurferToSchoolUseCase.handle(associateUserDto, authUser);
  }
}
