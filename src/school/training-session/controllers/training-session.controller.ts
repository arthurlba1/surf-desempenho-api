import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

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
import { SubmitSetupEvaluationCommand } from '@/school/training-session/application/commands/submit-setup-evaluation.command';
import { SubmitSetupEvaluationUseCase } from '@/school/training-session/application/commands/submit-setup-evaluation.use-case';
import { SendAudioMessageCommand } from '@/school/training-session/application/commands/send-audio-message.command';
import { SendAudioMessageUseCase } from '@/school/training-session/application/commands/send-audio-message.use-case';
import { SubmitSelfEvaluationCommand } from '@/school/training-session/application/commands/submit-self-evaluation.command';
import { SubmitSelfEvaluationUseCase } from '@/school/training-session/application/commands/submit-self-evaluation.use-case';
import { SubmitSelfSetupEvaluationCommand } from '@/school/training-session/application/commands/submit-self-setup-evaluation.command';
import { SubmitSelfSetupEvaluationUseCase } from '@/school/training-session/application/commands/submit-self-setup-evaluation.use-case';
import { GetTrainingSessionsQuery } from '@/school/training-session/application/queries/get-training-sessions.query';
import { GetTrainingSessionsUseCase } from '@/school/training-session/application/queries/get-training-sessions.use-case';
import { GetTrainingSessionUseCase } from '@/school/training-session/application/queries/get-training-session.use-case';
import {
  TrainingSessionResponse,
  toEvaluationResponse,
  toSetupEvaluationResponse,
  toSessionWithEvaluationsResponse,
} from '@/school/training-session/application/responses/training-session.response';
import {
  toSurferListItemDto,
  toSurferDetailDto,
} from '@/school/training-session/application/mappers/surfer-training-session.mapper';
import {
  SurferTrainingSessionListItemDto,
  SurferTrainingSessionDetailDto,
} from '@/school/training-session/application/dtos/surfer-training-session.dto';
import { IAthleteEvaluationRepositoryPort } from '@/school/training-session/domain/ports/athlete-evaluation.repository.port';
import { ISetupEvaluationRepositoryPort } from '@/school/training-session/domain/ports/setup-evaluation.repository.port';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole } from '@/school/schemas/membership.schema';

@ApiTags('Training Sessions')
@Controller('school/training-sessions')
export class TrainingSessionController {
  constructor(
    private readonly createTrainingSessionUseCase: CreateTrainingSessionUseCase,
    private readonly updateTrainingSessionUseCase: UpdateTrainingSessionUseCase,
    private readonly sendAudioMessageUseCase: SendAudioMessageUseCase,
    private readonly submitAthleteEvaluationUseCase: SubmitAthleteEvaluationUseCase,
    private readonly submitSetupEvaluationUseCase: SubmitSetupEvaluationUseCase,
    private readonly submitSelfEvaluationUseCase: SubmitSelfEvaluationUseCase,
    private readonly submitSelfSetupEvaluationUseCase: SubmitSelfSetupEvaluationUseCase,
    private readonly getTrainingSessionsUseCase: GetTrainingSessionsUseCase,
    private readonly getTrainingSessionUseCase: GetTrainingSessionUseCase,
    private readonly evaluationRepository: IAthleteEvaluationRepositoryPort,
    private readonly setupEvaluationRepository: ISetupEvaluationRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
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
  })
  async list(
    @Query() query: GetTrainingSessionsQuery,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse[] | SurferTrainingSessionListItemDto[]>> {
    const result = await this.getTrainingSessionsUseCase.handle(query, auth);
    const sessions = (result.detail || []) as any[];

    const userMembership = auth.currentActiveSchoolId
      ? await this.membershipRepository.findByUserIdAndSchoolId(auth.id, auth.currentActiveSchoolId)
      : null;

    if (userMembership?.role === MembershipRole.SURFER) {
      const surferItems = await Promise.all(
        sessions.map(async (s) => {
          const id = s.id ?? s._id?.toString();
          const [evaluations, setupEvaluations] = await Promise.all([
            this.evaluationRepository.findBySessionId(id),
            this.setupEvaluationRepository.findBySessionId(id),
          ]);
          return toSurferListItemDto(
            s,
            auth.id,
            evaluations.map(toEvaluationResponse),
            setupEvaluations.map(toSetupEvaluationResponse),
          );
        }),
      );
      return { message: result.message, detail: surferItems };
    }

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
  })
  async getById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse | SurferTrainingSessionDetailDto>> {
    const result = await this.getTrainingSessionUseCase.handle({ id }, auth);
    const session = result.detail as any;
    if (!session) return result as ApiResponseDto<TrainingSessionResponse>;

    const [evaluations, setupEvaluations, userMembership] = await Promise.all([
      this.evaluationRepository.findBySessionId(id),
      this.setupEvaluationRepository.findBySessionId(id),
      auth.currentActiveSchoolId
        ? this.membershipRepository.findByUserIdAndSchoolId(auth.id, auth.currentActiveSchoolId)
        : Promise.resolve(null),
    ]);

    if (userMembership?.role === MembershipRole.SURFER) {
      const detail = toSurferDetailDto(
        session,
        auth.id,
        evaluations.map(toEvaluationResponse),
        setupEvaluations.map(toSetupEvaluationResponse),
      );
      return { message: result.message, detail };
    }

    const response = toSessionWithEvaluationsResponse(
      session,
      evaluations.map(toEvaluationResponse),
      setupEvaluations.map(toSetupEvaluationResponse),
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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: Number(process.env.AUDIO_UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024),
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('audio/')) {
          cb(new BadRequestException('Only audio files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
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
    @UploadedFile() file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    command.sessionId = id;
    if (file) command.file = file;
    if (!command.file && !command.audioUrl) {
      throw new BadRequestException('Either file or audioUrl is required');
    }
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
    const [evaluations, setupEvaluations] = await Promise.all([
      this.evaluationRepository.findBySessionId(id),
      this.setupEvaluationRepository.findBySessionId(id),
    ]);
    const response = toSessionWithEvaluationsResponse(
      session,
      evaluations.map(toEvaluationResponse),
      setupEvaluations.map(toSetupEvaluationResponse),
    );
    return { message: result.message, detail: response };
  }

  @Post(':id/setup-evaluations')
  @RequireSchoolContext()
  @RequireSchoolRole('COACH', 'HEADCOACH')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit or update setup evaluation for the session' })
  @ApiResponse({
    status: 200,
    description: 'Setup evaluation saved successfully',
    type: ApiResponseDto<TrainingSessionResponse>,
  })
  async submitSetupEvaluation(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() command: SubmitSetupEvaluationCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<TrainingSessionResponse>> {
    const result = await this.submitSetupEvaluationUseCase.handle(
      { ...command, sessionId: id },
      auth,
    );
    const session = result.detail as any;
    if (!session) return result as ApiResponseDto<TrainingSessionResponse>;
    const [evaluations, setupEvaluations] = await Promise.all([
      this.evaluationRepository.findBySessionId(id),
      this.setupEvaluationRepository.findBySessionId(id),
    ]);
    const response = toSessionWithEvaluationsResponse(
      session,
      evaluations.map(toEvaluationResponse),
      setupEvaluations.map(toSetupEvaluationResponse),
    );
    return { message: result.message, detail: response };
  }

  @Post(':id/self-evaluation')
  @RequireSchoolContext()
  @RequireSchoolRole('SURFER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit or update self evaluation for the session (surfer only)' })
  @ApiResponse({
    status: 200,
    description: 'Self evaluation saved successfully',
  })
  async submitSelfEvaluation(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() command: SubmitSelfEvaluationCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<SurferTrainingSessionDetailDto>> {
    const result = await this.submitSelfEvaluationUseCase.handle(
      { ...command, sessionId: id },
      auth,
    );
    const session = result.detail as any;
    if (!session) return result as any;
    const [evaluations, setupEvaluations] = await Promise.all([
      this.evaluationRepository.findBySessionId(id),
      this.setupEvaluationRepository.findBySessionId(id),
    ]);
    const detail = toSurferDetailDto(
      session,
      auth.id,
      evaluations.map(toEvaluationResponse),
      setupEvaluations.map(toSetupEvaluationResponse),
    );
    return { message: result.message, detail };
  }

  @Post(':id/self-setup-evaluations')
  @RequireSchoolContext()
  @RequireSchoolRole('SURFER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit or update self setup evaluation (surfer only)' })
  @ApiResponse({
    status: 200,
    description: 'Self setup evaluation saved successfully',
  })
  async submitSelfSetupEvaluation(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() command: SubmitSelfSetupEvaluationCommand,
    @CurrentUser() auth: AuthUser,
  ): Promise<ApiResponseDto<SurferTrainingSessionDetailDto>> {
    await this.submitSelfSetupEvaluationUseCase.handle(
      { ...command, sessionId: id },
      auth,
    );
    const result = await this.getTrainingSessionUseCase.handle({ id }, auth);
    const session = result.detail as any;
    if (!session) return result as any;
    const [evaluations, setupEvaluations] = await Promise.all([
      this.evaluationRepository.findBySessionId(id),
      this.setupEvaluationRepository.findBySessionId(id),
    ]);
    const detail = toSurferDetailDto(
      session,
      auth.id,
      evaluations.map(toEvaluationResponse),
      setupEvaluations.map(toSetupEvaluationResponse),
    );
    return { message: result.message, detail };
  }
}
