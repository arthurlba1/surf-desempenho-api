import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  TrainingSession,
  TrainingSessionSchema,
} from '@/school/training-session/schemas/training-session.schema';
import { TrainingSessionRepository } from '@/school/training-session/infrastructure/persistence/training-session.repository';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { CreateTrainingSessionUseCase } from '@/school/training-session/application/commands/create-training-session.use-case';
import { UpdateTrainingSessionUseCase } from '@/school/training-session/application/commands/update-training-session.use-case';
import { SendAudioMessageUseCase } from '@/school/training-session/application/commands/send-audio-message.use-case';
import { GetTrainingSessionsUseCase } from '@/school/training-session/application/queries/get-training-sessions.use-case';
import { GetTrainingSessionUseCase } from '@/school/training-session/application/queries/get-training-session.use-case';
import { TrainingSessionController } from '@/school/training-session/controllers/training-session.controller';
import { SchoolModule } from '@/school/school.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingSession.name, schema: TrainingSessionSchema },
    ]),
    forwardRef(() => SchoolModule),
  ],
  controllers: [TrainingSessionController],
  providers: [
    {
      provide: ITrainingSessionRepositoryPort,
      useClass: TrainingSessionRepository,
    },
    CreateTrainingSessionUseCase,
    UpdateTrainingSessionUseCase,
    SendAudioMessageUseCase,
    GetTrainingSessionsUseCase,
    GetTrainingSessionUseCase,
  ],
  exports: [
    ITrainingSessionRepositoryPort,
    CreateTrainingSessionUseCase,
    UpdateTrainingSessionUseCase,
    SendAudioMessageUseCase,
    GetTrainingSessionsUseCase,
    GetTrainingSessionUseCase,
  ],
})
export class TrainingSessionModule {}
