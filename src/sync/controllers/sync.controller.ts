import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { SyncCommandsCommand } from '@/sync/application/commands/sync-commands.command';
import { SyncCommandsUseCase } from '@/sync/application/commands/sync-commands.use-case';
import { SyncCommandsResponse } from '@/sync/application/responses/sync-commands.response';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncCommandsUseCase: SyncCommandsUseCase) {}

  @Post('commands')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit batch of offline commands for idempotent replay' })
  @ApiResponse({
    status: 200,
    description: 'Commands processed',
    type: ApiResponseDto<SyncCommandsResponse>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async syncCommands(
    @Body() command: SyncCommandsCommand,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponseDto<SyncCommandsResponse>> {
    for (const cmd of command.commands) {
      if (cmd.actorUserId !== user.id) {
        throw new BadRequestException('Command actorUserId does not match authenticated user');
      }
    }

    return await this.syncCommandsUseCase.handle(command);
  }
}
