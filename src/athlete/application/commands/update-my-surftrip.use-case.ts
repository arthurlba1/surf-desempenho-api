import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';
import { UpdateMySurftripCommand } from './update-my-surftrip.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

type Payload = UpdateMySurftripCommand & { id: string };

@Injectable()
export class UpdateMySurftripUseCase extends BaseUseCase<Payload, any> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly surftripRepository: ISurftripRepositoryPort,
  ) {
    super();
  }

  async handle(payload: Payload, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const profile = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {});
    const athleteId = asId(profile);

    const updated = await this.surftripRepository.updateByIdAndAthleteId(payload.id, athleteId, {
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

    if (!updated) throw new NotFoundException('Trip not found');

    return this.ok('Trip updated successfully', {
      id: asId(updated),
      athleteId: updated.athleteId,
      name: updated.name,
      startDate: updated.startDate,
      endDate: updated.endDate,
      location: updated.location,
      quiver: updated.quiver,
      technicalPerformance: updated.technicalPerformance,
      physicalPerformance: updated.physicalPerformance,
      performance: updated.performance,
      planning: updated.planning,
      accumulatedSkills: updated.accumulatedSkills,
      accompaniedByCoach: updated.accompaniedByCoach,
    });
  }
}
