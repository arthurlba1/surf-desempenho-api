import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommandInbox, CommandInboxSchema } from '@/sync/schemas/command-inbox.schema';
import { CommandInboxRepository } from '@/sync/infrastructure/persistence/command-inbox.repository';
import { ICommandInboxRepositoryPort } from '@/sync/domain/ports/command-inbox.repository.port';
import { CommandProcessorService } from '@/sync/application/services/command-processor.service';
import { SyncCommandsUseCase } from '@/sync/application/commands/sync-commands.use-case';
import { SyncController } from '@/sync/controllers/sync.controller';
import { IdentityModule } from '@/identity/identity.module';
import { SchoolModule } from '@/school/school.module';
import { AthleteModule } from '@/athlete/athlete.module';
import { TrainingSessionModule } from '@/school/training-session/training-session.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommandInbox.name, schema: CommandInboxSchema },
    ]),
    IdentityModule,
    SchoolModule,
    AthleteModule,
    TrainingSessionModule,
  ],
  controllers: [SyncController],
  providers: [
    {
      provide: ICommandInboxRepositoryPort,
      useClass: CommandInboxRepository,
    },
    CommandProcessorService,
    SyncCommandsUseCase,
  ],
  exports: [
    ICommandInboxRepositoryPort,
    CommandProcessorService,
    SyncCommandsUseCase,
  ],
})

export class SyncModule {}
