import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';
import { DeleteMySurftripResponse } from '@/athlete/application/responses/delete-my-surftrip.response';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class DeleteMySurftripUseCase extends BaseUseCase<{ id: string }, DeleteMySurftripResponse> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly surftripRepository: ISurftripRepositoryPort,
  ) {
    super();
  }

  async handle(payload: { id: string }, auth?: AuthUser): Promise<IUseCaseResponse<DeleteMySurftripResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const profile = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {});
    const athleteId = asId(profile);

    const deleted = await this.surftripRepository.deleteByIdAndAthleteId(payload.id, athleteId);
    return this.ok('Trip deleted successfully', new DeleteMySurftripResponse(deleted));
  }
}
