import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';
import { DeleteMyAthleteProfileResponse } from '@/athlete/application/responses/delete-my-athlete-profile.response';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class DeleteMyAthleteProfileUseCase extends BaseUseCase<unknown, DeleteMyAthleteProfileResponse> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly competitiveRecordRepository: ICompetitiveRecordRepositoryPort,
    private readonly surftripRepository: ISurftripRepositoryPort,
  ) {
    super();
  }

  async handle(_payload: unknown, auth?: AuthUser): Promise<IUseCaseResponse<DeleteMyAthleteProfileResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const existing = await this.athleteProfileRepository.findByUserId(auth.id);
    if (!existing) {
      return this.ok('Athlete profile deleted successfully', new DeleteMyAthleteProfileResponse(false, 0, 0));
    }

    const athleteId = asId(existing);
    const [deletedCompetitiveRecords, deletedTrips] = await Promise.all([
      this.competitiveRecordRepository.deleteManyByAthleteId(athleteId),
      this.surftripRepository.deleteManyByAthleteId(athleteId),
    ]);

    const deleted = await this.athleteProfileRepository.deleteByUserId(auth.id);

    return this.ok(
      'Athlete profile deleted successfully',
      new DeleteMyAthleteProfileResponse(deleted, deletedCompetitiveRecords, deletedTrips),
    );
  }
}
