import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';
import { CreateMyCompetitiveRecordCommand } from './create-my-competitive-record.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class CreateMyCompetitiveRecordUseCase extends BaseUseCase<CreateMyCompetitiveRecordCommand, any> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly competitiveRecordRepository: ICompetitiveRecordRepositoryPort,
  ) {
    super();
  }

  async handle(payload: CreateMyCompetitiveRecordCommand, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const profile = await this.athleteProfileRepository.updateUpsertByUserId(auth.id, {});
    const athleteId = asId(profile);

    const created = await this.competitiveRecordRepository.create({
      athleteId,
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

    return this.ok('Competitive record created successfully', {
      id: asId(created),
      athleteId: created.athleteId,
      name: created.name,
      date: created.date,
      country: created.country,
      city: created.city,
      beach: created.beach,
      peakName: created.peakName,
      responsibleAssociation: created.responsibleAssociation,
      placement: created.placement,
      prize: created.prize,
      equipments: created.equipments,
    });
  }
}
