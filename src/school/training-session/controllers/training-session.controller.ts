import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth.types';
import { RequireSchoolContext } from '@/auth/decorators/require-school-context.decorator';
import { RequireSchoolRole } from '@/auth/decorators/require-school-role.decorator';
import { ParseObjectIdPipe } from '@/common/pipes/parse-objectid.pipe';

import { CreateTrainingSessionCommand } from '@/school/training-session/application/commands/create-training-session.command';
import { CreateTrainingSessionUseCase } from '@/school/training-session/application/commands/create-training-session.use-case';
import { UpdateTrainingSessionCommand } from '@/school/training-session/application/commands/update-training-session.command';
import { UpdateTrainingSessionUseCase } from '@/school/training-session/application/commands/update-training-session.use-case';
import { SendAudioMessageCommand } from '@/school/training-session/application/commands/send-audio-message.command';
import { SendAudioMessageUseCase } from '@/school/training-session/application/commands/send-audio-message.use-case';
import { GetTrainingSessionsQuery } from '@/school/training-session/application/queries/get-training-sessions.query';
import { GetTrainingSessionsUseCase } from '@/school/training-session/application/queries/get-training-sessions.use-case';
import { GetTrainingSessionUseCase } from '@/school/training-session/application/queries/get-training-session.use-case';
import { TrainingSessionResponse } from '@/school/training-session/application/responses/training-session.response';

@ApiTags('Training Sessions')
@Controller('school/training-sessions')
export class TrainingSessionController {
  constructor(
    private readonly createTrainingSessionUseCase: CreateTrainingSessionUseCase,
    private readonly updateTrainingSessionUseCase: UpdateTrainingSessionUseCase,
    private readonly sendAudioMessageUseCase: SendAudioMessageUseCase,
    private readonly getTrainingSessionsUseCase: GetTrainingSessionsUseCase,
    private readonly getTrainingSessionUseCase: GetTrainingSessionUseCase,
  ) {}

  @Post()
  @RequireSchoolContext()
  @RequireSchoolRole('COACH', 'HEADCOACH')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new training session' })
  @ApiResponse({
    status: 201,
    description: 'Training session created successfully',
    type: ApiResponseDto<TrainingSessionResponse>,
  })
  async create(
    @Body() command: CreateTrainingSessionCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    return await this.createTrainingSessionUseCase.handle(command, auth);
  }

  @Get('all')
  @RequireSchoolContext()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List training sessions (filtered by user role)' })
  @ApiResponse({
    status: 200,
    description: 'Training sessions retrieved successfully',
    type: ApiResponseDto<[TrainingSessionResponse]>,
  })
  async list(
    @Query() query: GetTrainingSessionsQuery,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse[]>> {
    return await this.getTrainingSessionsUseCase.handle(query, auth);
  }

  @Get(':id')
  @RequireSchoolContext()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a specific training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session retrieved successfully',
    type: ApiResponseDto<TrainingSessionResponse>,
  })
  async getById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    return await this.getTrainingSessionUseCase.handle({ id }, auth);
  }

  @Patch(':id')
  @RequireSchoolContext()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session updated successfully',
    type: ApiResponseDto<TrainingSessionResponse>,
  })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() command: UpdateTrainingSessionCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    command.id = id;
    return await this.updateTrainingSessionUseCase.handle(command, auth);
  }

  @Post(':id/audio')
  @RequireSchoolContext()
  @RequireSchoolRole('COACH', 'HEADCOACH')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send audio message to a participant' })
  @ApiResponse({
    status: 200,
    description: 'Audio message sent successfully',
    type: ApiResponseDto<TrainingSessionResponse>,
  })
  async sendAudio(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() command: SendAudioMessageCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    command.sessionId = id;
    return await this.sendAudioMessageUseCase.handle(command, auth);
  }
}
