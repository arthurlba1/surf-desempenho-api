import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MembershipsModule } from '@/memberships/memberships.module';
import { UsersModule } from '@/users/users.module';
import { SessionModule } from '@/session/session.module';
import { AthletesController } from '@/athletes/athletes.controller';
import { ListAthletesUseCase } from '@/athletes/use-cases/list-athletes.use-case';
import { GetAthleteByIdUseCase } from '@/athletes/use-cases/get-athlete-by-id.use-case';
import { GetAthleteBodyDataUseCase } from '@/athletes/use-cases/get-athlete-body-data.use-case';
import { GetAthleteEquipmentUseCase } from '@/athletes/use-cases/get-athlete-equipment.use-case';
import { GetAthleteCompetitionsUseCase } from '@/athletes/use-cases/get-athlete-competitions.use-case';
import { GetAthleteSurftripsUseCase } from '@/athletes/use-cases/get-athlete-surftrips.use-case';
import { AthleteBodyData, AthleteBodyDataSchema } from '@/athletes/schemas/athlete-body-data.schema';
import { AthleteEquipment, AthleteEquipmentSchema } from '@/athletes/schemas/athlete-equipment.schema';
import { AthleteCompetition, AthleteCompetitionSchema } from '@/athletes/schemas/athlete-competition.schema';
import { AthleteSurftrip, AthleteSurftripSchema } from '@/athletes/schemas/athlete-surftrip.schema';
import { AthleteBodyDataRepository } from '@/athletes/infrastructure/athlete-body-data.repository';
import { AthleteEquipmentRepository } from '@/athletes/infrastructure/athlete-equipment.repository';
import { AthleteCompetitionRepository } from '@/athletes/infrastructure/athlete-competition.repository';
import { AthleteSurftripRepository } from '@/athletes/infrastructure/athlete-surftrip.repository';
import { IAthleteBodyDataRepository } from '@/athletes/repositories/athlete-body-data.repository.interface';
import { IAthleteEquipmentRepository } from '@/athletes/repositories/athlete-equipment.repository.interface';
import { IAthleteCompetitionRepository } from '@/athletes/repositories/athlete-competition.repository.interface';
import { IAthleteSurftripRepository } from '@/athletes/repositories/athlete-surftrip.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AthleteBodyData.name, schema: AthleteBodyDataSchema },
      { name: AthleteEquipment.name, schema: AthleteEquipmentSchema },
      { name: AthleteCompetition.name, schema: AthleteCompetitionSchema },
      { name: AthleteSurftrip.name, schema: AthleteSurftripSchema },
    ]),
    MembershipsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => SessionModule),
  ],
  providers: [
    {
      provide: IAthleteBodyDataRepository,
      useClass: AthleteBodyDataRepository,
    },
    {
      provide: IAthleteEquipmentRepository,
      useClass: AthleteEquipmentRepository,
    },
    {
      provide: IAthleteCompetitionRepository,
      useClass: AthleteCompetitionRepository,
    },
    {
      provide: IAthleteSurftripRepository,
      useClass: AthleteSurftripRepository,
    },
    ListAthletesUseCase,
    GetAthleteByIdUseCase,
    GetAthleteBodyDataUseCase,
    GetAthleteEquipmentUseCase,
    GetAthleteCompetitionsUseCase,
    GetAthleteSurftripsUseCase,
  ],
  controllers: [AthletesController],
})
export class AthletesModule {}

