import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { UpdateMeCommand } from '@/identity/application/commands/update-me.command';
import { UpdateMeUseCase } from '@/identity/application/commands/update-me.use-case';
import { GetUserByIdUseCase } from '@/identity/application/queries/get-user-by-id.use-case';
import { UserEntity } from '@/identity/domain/entities/user.entity';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';
import { ParseObjectIdPipe } from '@/common/pipes/parse-objectid.pipe';
import { LoggedUserResponse } from '@/auth/application/responses/logged-user.response';

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Get('users/:id')
  async findById(@Param('id', ParseObjectIdPipe) id: string): Promise<ApiResponseDto<UserEntity>> {
    return await this.getUserByIdUseCase.handle({ id });
  }

  @Patch('me')
  async updateMe(
    @Body() command: UpdateMeCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<LoggedUserResponse>> {
    return await this.updateMeUseCase.handle(command, auth);
  }
}
