import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-objectid.pipe';
import { CreateSessionDto } from '@/session/dtos/create-session.dto';
import { UpdateSessionDto } from '@/session/dtos/update-session.dto';
import { CreateSessionUseCase } from '@/session/use-cases/create-session.use-case';
import { UpdateSessionUseCase } from '@/session/use-cases/update-session.use-case';
import { GetSessionUseCase } from '@/session/use-cases/get-session.use-case';
import { DeleteAthleteFromSessionUseCase } from '@/session/use-cases/delete-athlete-from-session.use-case';
import { ListSessionsDetail, ListSessionsUseCase } from '@/session/use-cases/list-sessions.use-case';
import { SessionResponseDto } from '@/session/dtos/session-response.dto';


@Controller('session')
export class SessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly deleteAthleteFromSessionUseCase: DeleteAthleteFromSessionUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() auth: AuthUser, @Body() dto: CreateSessionDto): Promise<ApiResponseDto<SessionResponseDto>> {
    return await this.createSessionUseCase.handle(dto, auth);
  }

  @Get()
  async findAll(@CurrentUser() auth: AuthUser): Promise<ApiResponseDto<ListSessionsDetail>> {
    return await this.listSessionsUseCase.handle(undefined, auth);
  }

  @Put(':id')
  async update(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ): Promise<ApiResponseDto<SessionResponseDto>> {
    return await this.updateSessionUseCase.handle({ id, ...dto }, auth);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApiResponseDto<SessionResponseDto>> {
    return await this.getSessionUseCase.handle({ id }, auth);
  }

  @Delete(':id/athlete/:athleteId')
  async deleteAthlete(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('athleteId', ParseObjectIdPipe) athleteId: string,
  ): Promise<ApiResponseDto<SessionResponseDto>> {
    return await this.deleteAthleteFromSessionUseCase.handle(
      { sessionId: id, athleteMembershipId: athleteId },
      auth,
    );
  }
}
