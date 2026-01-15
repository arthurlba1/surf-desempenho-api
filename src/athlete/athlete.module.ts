import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SchoolModule } from '@/school/school.module';
import { IdentityModule } from '@/identity/identity.module';

import { AthleteProfile, AthleteProfileSchema } from '@/athlete/schemas/athlete-profile.schema';
import { CompetitiveRecord, CompetitiveRecordSchema } from '@/athlete/schemas/competitive-record.schema';
import { Surftrip, SurftripSchema } from '@/athlete/schemas/surftrip.schema';
import { Surfboard, SurfboardSchema } from '@/athlete/schemas/surfboard.schema';
import { Fin, FinSchema } from '@/athlete/schemas/fin.schema';
import { BoardSetup, BoardSetupSchema } from '@/athlete/schemas/board-setup.schema';

import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';
import { ISurfboardRepositoryPort } from '@/athlete/domain/ports/surfboard.repository.port';
import { IFinRepositoryPort } from '@/athlete/domain/ports/fin.repository.port';
import { IBoardSetupRepositoryPort } from '@/athlete/domain/ports/board-setup.repository.port';

import { AthleteProfileRepository } from '@/athlete/infrastructure/persistence/athlete-profile.repository';
import { CompetitiveRecordRepository } from '@/athlete/infrastructure/persistence/competitive-record.repository';
import { SurftripRepository } from '@/athlete/infrastructure/persistence/surftrip.repository';
import { SurfboardRepository } from '@/athlete/infrastructure/persistence/surfboard.repository';
import { FinRepository } from '@/athlete/infrastructure/persistence/fin.repository';
import { BoardSetupRepository } from '@/athlete/infrastructure/persistence/board-setup.repository';
import { AthleteController } from '@/athlete/controllers/athlete.controller';
import { GetAthleteSheetUseCase } from '@/athlete/application/queries/get-athlete-sheet.use-case';
import { GetMyAthleteProfileUseCase } from '@/athlete/application/queries/get-my-athlete-profile.use-case';
import { UpsertMyAthleteProfileUseCase } from '@/athlete/application/commands/upsert-my-athlete-profile.use-case';
import { DeleteMyAthleteProfileUseCase } from '@/athlete/application/commands/delete-my-athlete-profile.use-case';
import { CreateMyCompetitiveRecordUseCase } from '@/athlete/application/commands/create-my-competitive-record.use-case';
import { UpdateMyCompetitiveRecordUseCase } from '@/athlete/application/commands/update-my-competitive-record.use-case';
import { DeleteMyCompetitiveRecordUseCase } from '@/athlete/application/commands/delete-my-competitive-record.use-case';
import { CreateMySurftripUseCase } from '@/athlete/application/commands/create-my-surftrip.use-case';
import { UpdateMySurftripUseCase } from '@/athlete/application/commands/update-my-surftrip.use-case';
import { DeleteMySurftripUseCase } from '@/athlete/application/commands/delete-my-surftrip.use-case';
import { CreateMySurfboardUseCase } from '@/athlete/application/commands/create-my-surfboard.use-case';
import { UpdateMySurfboardUseCase } from '@/athlete/application/commands/update-my-surfboard.use-case';
import { DeleteMySurfboardUseCase } from '@/athlete/application/commands/delete-my-surfboard.use-case';
import { CreateMyFinUseCase } from '@/athlete/application/commands/create-my-fin.use-case';
import { UpdateMyFinUseCase } from '@/athlete/application/commands/update-my-fin.use-case';
import { DeleteMyFinUseCase } from '@/athlete/application/commands/delete-my-fin.use-case';
import { CreateMyBoardSetupUseCase } from '@/athlete/application/commands/create-my-board-setup.use-case';
import { UpdateMyBoardSetupUseCase } from '@/athlete/application/commands/update-my-board-setup.use-case';
import { DeleteMyBoardSetupUseCase } from '@/athlete/application/commands/delete-my-board-setup.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: CompetitiveRecord.name, schema: CompetitiveRecordSchema },
      { name: Surftrip.name, schema: SurftripSchema },
      { name: Surfboard.name, schema: SurfboardSchema },
      { name: Fin.name, schema: FinSchema },
      { name: BoardSetup.name, schema: BoardSetupSchema },
    ]),
    // For authorization checks (memberships) + fetching athlete user snapshot if needed later
    forwardRef(() => SchoolModule),
    forwardRef(() => IdentityModule),
  ],
  controllers: [AthleteController],
  providers: [
    { provide: IAthleteProfileRepositoryPort, useClass: AthleteProfileRepository },
    { provide: ICompetitiveRecordRepositoryPort, useClass: CompetitiveRecordRepository },
    { provide: ISurftripRepositoryPort, useClass: SurftripRepository },
    { provide: ISurfboardRepositoryPort, useClass: SurfboardRepository },
    { provide: IFinRepositoryPort, useClass: FinRepository },
    { provide: IBoardSetupRepositoryPort, useClass: BoardSetupRepository },
    GetAthleteSheetUseCase,
    GetMyAthleteProfileUseCase,
    UpsertMyAthleteProfileUseCase,
    DeleteMyAthleteProfileUseCase,
    CreateMyCompetitiveRecordUseCase,
    UpdateMyCompetitiveRecordUseCase,
    DeleteMyCompetitiveRecordUseCase,
    CreateMySurftripUseCase,
    UpdateMySurftripUseCase,
    DeleteMySurftripUseCase,
    CreateMySurfboardUseCase,
    UpdateMySurfboardUseCase,
    DeleteMySurfboardUseCase,
    CreateMyFinUseCase,
    UpdateMyFinUseCase,
    DeleteMyFinUseCase,
    CreateMyBoardSetupUseCase,
    UpdateMyBoardSetupUseCase,
    DeleteMyBoardSetupUseCase,
  ],
  exports: [
    IAthleteProfileRepositoryPort,
    ICompetitiveRecordRepositoryPort,
    ISurftripRepositoryPort,
    ISurfboardRepositoryPort,
    IFinRepositoryPort,
    IBoardSetupRepositoryPort,
    GetAthleteSheetUseCase,
    GetMyAthleteProfileUseCase,
    UpsertMyAthleteProfileUseCase,
    DeleteMyAthleteProfileUseCase,
    CreateMyCompetitiveRecordUseCase,
    UpdateMyCompetitiveRecordUseCase,
    DeleteMyCompetitiveRecordUseCase,
    CreateMySurftripUseCase,
    UpdateMySurftripUseCase,
    DeleteMySurftripUseCase,
    CreateMySurfboardUseCase,
    UpdateMySurfboardUseCase,
    DeleteMySurfboardUseCase,
    CreateMyFinUseCase,
    UpdateMyFinUseCase,
    DeleteMyFinUseCase,
    CreateMyBoardSetupUseCase,
    UpdateMyBoardSetupUseCase,
    DeleteMyBoardSetupUseCase,
  ],
})
export class AthleteModule {}
