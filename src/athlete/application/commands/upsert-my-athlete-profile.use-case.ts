import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { UpsertMyAthleteProfileCommand } from './upsert-my-athlete-profile.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class UpsertMyAthleteProfileUseCase extends BaseUseCase<UpsertMyAthleteProfileCommand, any> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
  ) {
    super();
  }

  async handle(payload: UpsertMyAthleteProfileCommand, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const updated = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {
      ...payload,
    } as any);

    return this.ok('Athlete profile updated successfully', {
      id: asId(updated),
      userId: updated.userId,
      weight: updated.weight,
      height: updated.height,
      footSize: updated.footSize,
      predominantStance: updated.predominantStance,
      swimmingProficiency: updated.swimmingProficiency,
      surfingStart: updated.surfingStart,
      emergencyProficiency: updated.emergencyProficiency,
      emergencyContact: updated.emergencyContact,
      healthPlan: updated.healthPlan,
    });
  }
}
