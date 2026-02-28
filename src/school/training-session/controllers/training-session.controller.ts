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
import { SubmitAthleteEvaluationCommand } from '@/school/training-session/application/commands/submit-athlete-evaluation.command';
import { SubmitAthleteEvaluationUseCase } from '@/school/training-session/application/commands/submit-athlete-evaluation.use-case';
import { SendAudioMessageCommand } from '@/school/training-session/application/commands/send-audio-message.command';
import { SendAudioMessageUseCase } from '@/school/training-session/application/commands/send-audio-message.use-case';
import { GetTrainingSessionsQuery } from '@/school/training-session/application/queries/get-training-sessions.query';
import { GetTrainingSessionsUseCase } from '@/school/training-session/application/queries/get-training-sessions.use-case';
import { GetTrainingSessionUseCase } from '@/school/training-session/application/queries/get-training-session.use-case';
import {
  TrainingSessionResponse,
  toEvaluationResponse,
  toSessionWithEvaluationsResponse,
} from '@/school/training-session/application/responses/training-session.response';
import { IAthleteEvaluationRepositoryPort } from '@/school/training-session/domain/ports/athlete-evaluation.repository.port';

@ApiTags('Training Sessions')
@Controller('school/training-sessions')
export class TrainingSessionController {
  constructor(
    private readonly createTrainingSessionUseCase: CreateTrainingSessionUseCase,
    private readonly updateTrainingSessionUseCase: UpdateTrainingSessionUseCase,
    private readonly sendAudioMessageUseCase: SendAudioMessageUseCase,
    private readonly submitAthleteEvaluationUseCase: SubmitAthleteEvaluationUseCase,
    private readonly getTrainingSessionsUseCase: GetTrainingSessionsUseCase,
    private readonly getTrainingSessionUseCase: GetTrainingSessionUseCase,
    private readonly evaluationRepository: IAthleteEvaluationRepositoryPort,
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
    const result = await this.getTrainingSessionsUseCase.handle(query, auth);
    const sessions = (result.detail || []) as TrainingSessionResponse[];
    const withPending = sessions.map((s) =>
      toSessionWithEvaluationsResponse(s, s.evaluations ?? []),
    );
    return { message: result.message, detail: withPending };
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
    const result = await this.getTrainingSessionUseCase.handle({ id }, auth);
    const session = result.detail as any;
    if (!session) return result as ApiResponseDto<TrainingSessionResponse>;
    const evaluations = await this.evaluationRepository.findBySessionId(id);
    const response = toSessionWithEvaluationsResponse(
      session,
      evaluations.map(toEvaluationResponse),
    );
    return { message: result.message, detail: response };
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

  @Post(':id/evaluations')
  @RequireSchoolContext()
  @RequireSchoolRole('COACH', 'HEADCOACH')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit or update athlete evaluation for the session' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation saved successfully',
    type: ApiResponseDto<TrainingSessionResponse>,
  })
  async submitEvaluation(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() command: SubmitAthleteEvaluationCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    const result = await this.submitAthleteEvaluationUseCase.handle(
      { ...command, sessionId: id },
      auth,
    );
    const session = result.detail as any;
    if (!session) return result as ApiResponseDto<TrainingSessionResponse>;
    const evaluations = await this.evaluationRepository.findBySessionId(id);
    const response = toSessionWithEvaluationsResponse(
      session,
      evaluations.map(toEvaluationResponse),
    );
    return { message: result.message, detail: response };
  }
}
