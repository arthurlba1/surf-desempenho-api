import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';
import { DeleteMyCompetitiveRecordResponse } from '@/athlete/application/responses/delete-my-competitive-record.response';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class DeleteMyCompetitiveRecordUseCase extends BaseUseCase<{ id: string }, DeleteMyCompetitiveRecordResponse> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly competitiveRecordRepository: ICompetitiveRecordRepositoryPort,
  ) {
    super();
  }

  async handle(payload: { id: string }, auth?: AuthUser): Promise<IUseCaseResponse<DeleteMyCompetitiveRecordResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const profile = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {});
    const athleteId = asId(profile);

    const deleted = await this.competitiveRecordRepository.deleteByIdAndAthleteId(payload.id, athleteId);
    return this.ok('Competitive record deleted successfully', new DeleteMyCompetitiveRecordResponse(deleted));
  }
}
