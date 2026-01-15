import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { CreateSchoolCommand } from '@/school/application/commands/create-school.command';
import { CreateSchoolUseCase } from '@/school/application/commands/create-school.use-case';
import { GetSchoolByIdUseCase } from '@/school/application/queries/get-school-by-id.use-case';
import { SchoolEntity } from '@/school/domain/entities/school.entity';
import { ParseObjectIdPipe } from '@/common/pipes/parse-objectid.pipe';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';
import { RequireSchoolContext } from '@/auth/decorators/require-school-context.decorator';
import { RequireSchoolRole } from '@/auth/decorators/require-school-role.decorator';
import { GetSchoolOverviewUseCase } from '@/school/application/queries/get-school-overview.use-case';
import { SchoolOverviewResponse } from '@/school/application/responses/school-overview.response';
import { GetSchoolAthletesUseCase } from '@/school/application/queries/get-school-athletes.use-case';
import { GetSchoolAthletesQuery } from '@/school/application/queries/get-school-athletes.query';
import { SchoolAthleteResponse } from '@/school/application/responses/school-athlete.response';
import { SchoolInviteLinkResponse } from '@/school/application/responses/school-invite-link.response';
import { JoinSchoolInviteUseCase } from '@/school/application/commands/join-school-invite.use-case';
import { JoinSchoolInviteCommand } from '@/school/application/commands/join-school-invite.command';
import { MembershipEntity } from '@/school/domain/entities/membership.entity';
import { GetSchoolInviteLinkUseCase } from '@/school/application/queries/get-school-invite-link.use-case';

@Controller('school')
export class SchoolController {
  constructor(
    private readonly createSchoolUseCase: CreateSchoolUseCase,
    private readonly getSchoolByIdUseCase: GetSchoolByIdUseCase,
    private readonly getSchoolOverviewUseCase: GetSchoolOverviewUseCase,
    private readonly getSchoolAthletesUseCase: GetSchoolAthletesUseCase,
    private readonly joinSchoolInviteUseCase: JoinSchoolInviteUseCase,
    private readonly getSchoolInviteLinkUseCase: GetSchoolInviteLinkUseCase,
  ) {}

  @Post()
  async create(@Body() command: CreateSchoolCommand): Promise<ApiResponseDto<SchoolEntity>> {
    return await this.createSchoolUseCase.handle(command);
  }

  @Get('overview')
  @RequireSchoolContext()
  async overview(@CurrentUser() auth: AuthUser): Promise<ApiResponseDto<SchoolOverviewResponse>> {
    return await this.getSchoolOverviewUseCase.handle({}, auth);
  }

  @Get('athletes')
  @RequireSchoolRole('COACH', 'HEADCOACH')
  async listAthletes(
    @Query('status') status: string | undefined,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<SchoolAthleteResponse[]>> {
    const result = await this.getSchoolAthletesUseCase.handle({ status } as GetSchoolAthletesQuery, auth);
    return result;
  }

  @Get('invite')
  @RequireSchoolRole('COACH', 'HEADCOACH')
  async getInviteLink(@CurrentUser() auth: AuthUser): Promise<ApiResponseDto<SchoolInviteLinkResponse>> {
    return await this.getSchoolInviteLinkUseCase.handle({}, auth);
  }

  @Post('invites/:token/join')
  async joinByInvite(
    @Param('token') token: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<MembershipEntity>> {
   return await this.joinSchoolInviteUseCase.handle({ token } as JoinSchoolInviteCommand, auth);
  }

  @Get(':id')
  async findById(@Param('id', ParseObjectIdPipe) id: string): Promise<ApiResponseDto<SchoolEntity>> {
    return await this.getSchoolByIdUseCase.handle({ id });
  }
}
