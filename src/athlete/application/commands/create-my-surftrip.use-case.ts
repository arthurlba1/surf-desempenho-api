import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';
import { CreateMySurftripCommand } from './create-my-surftrip.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class CreateMySurftripUseCase extends BaseUseCase<CreateMySurftripCommand, any> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly surftripRepository: ISurftripRepositoryPort,
  ) {
    super();
  }

  async handle(payload: CreateMySurftripCommand, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const profile = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {});
    const athleteId = asId(profile);

    const created = await this.surftripRepository.create({
      athleteId,
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      location: payload.location,
      quiver: payload.quiver,
      technicalPerformance: payload.technicalPerformance,
      physicalPerformance: payload.physicalPerformance,
      performance: payload.performance,
      planning: payload.planning,
      accumulatedSkills: payload.accumulatedSkills,
      accompaniedByCoach: payload.accompaniedByCoach,
    });

    return this.ok('Trip created successfully', {
      id: asId(created),
      athleteId: created.athleteId,
      name: created.name,
      startDate: created.startDate,
      endDate: created.endDate,
      location: created.location,
      quiver: created.quiver,
      technicalPerformance: created.technicalPerformance,
      physicalPerformance: created.physicalPerformance,
      performance: created.performance,
      planning: created.planning,
      accumulatedSkills: created.accumulatedSkills,
      accompaniedByCoach: created.accompaniedByCoach,
    });
  }
}
