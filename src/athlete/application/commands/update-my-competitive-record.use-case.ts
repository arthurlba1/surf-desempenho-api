import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';
import { UpdateMyCompetitiveRecordCommand } from './update-my-competitive-record.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

type Payload = UpdateMyCompetitiveRecordCommand & { id: string };

@Injectable()
export class UpdateMyCompetitiveRecordUseCase extends BaseUseCase<Payload, any> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly competitiveRecordRepository: ICompetitiveRecordRepositoryPort,
  ) {
    super();
  }

  async handle(payload: Payload, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const profile = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {});
    const athleteId = asId(profile);

    const updated = await this.competitiveRecordRepository.updateByIdAndAthleteId(payload.id, athleteId, {
      name: payload.name,
      date: payload.date,
      country: payload.country,
      city: payload.city,
      beach: payload.beach,
      peakName: payload.peakName,
      responsibleAssociation: payload.responsibleAssociation,
      placement: payload.placement,
      prize: payload.prize,
      equipments: payload.equipments,
    });

    if (!updated) throw new NotFoundException('Competitive record not found');

    return this.ok('Competitive record updated successfully', {
      id: asId(updated),
      athleteId: updated.athleteId,
      name: updated.name,
      date: updated.date,
      country: updated.country,
      city: updated.city,
      beach: updated.beach,
      peakName: updated.peakName,
      responsibleAssociation: updated.responsibleAssociation,
      placement: updated.placement,
      prize: updated.prize,
      equipments: updated.equipments,
    });
  }
}
