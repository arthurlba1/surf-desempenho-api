import { Module, forwardRef } from '@nestjs/common';

import { MembershipsModule } from '@/memberships/memberships.module';
import { UsersModule } from '@/users/users.module';
import { AthletesController } from '@/athletes/athletes.controller';
import { ListAthletesUseCase } from '@/athletes/use-cases/list-athletes.use-case';
import { GetAthleteByIdUseCase } from '@/athletes/use-cases/get-athlete-by-id.use-case';
import { GetAthleteBodyDataUseCase } from '@/athletes/use-cases/get-athlete-body-data.use-case';
import { GetAthleteEquipmentUseCase } from '@/athletes/use-cases/get-athlete-equipment.use-case';
import { GetAthleteCompetitionsUseCase } from '@/athletes/use-cases/get-athlete-competitions.use-case';
import { GetAthleteSurftripsUseCase } from '@/athletes/use-cases/get-athlete-surftrips.use-case';

@Module({
  imports: [
    MembershipsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
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

