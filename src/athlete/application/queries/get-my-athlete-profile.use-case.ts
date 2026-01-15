import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { AthleteProfileResponse } from '@/athlete/application/responses/athlete-profile.response';
import { GetMyAthleteProfileQuery } from './get-my-athlete-profile.query';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class GetMyAthleteProfileUseCase extends BaseUseCase<
  GetMyAthleteProfileQuery,
  AthleteProfileResponse
> {
  constructor(
    private readonly athleteProfileRepository: IAthleteProfileRepositoryPort,
    private readonly userRepository: IUserRepositoryPort,
  ) {
    super();
  }

  async handle(
    _payload: GetMyAthleteProfileQuery,
    auth?: AuthUser,
  ): Promise<IUseCaseResponse<AthleteProfileResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const [user, profile] = await Promise.all([
      this.userRepository.findById(auth.id),
      this.athleteProfileRepository.findByUserId(auth.id),
    ]);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const athleteId = profile ? asId(profile) : null;

    const response = new AthleteProfileResponse();
    response.id = athleteId ?? '';
    response.userId = auth.id;
    response.name = user.name;
    response.birthdate = user.birthdate;
    response.profilePictureUrl = user.profilePictureUrl;
    response.weight = profile?.weight;
    response.height = profile?.height;
    response.footSize = profile?.footSize;
    response.predominantStance = profile?.predominantStance;
    response.swimmingProficiency = profile?.swimmingProficiency;
    response.surfingStart = profile?.surfingStart;
    response.emergencyProficiency = profile?.emergencyProficiency;
    response.emergencyContact = profile?.emergencyContact;
    response.healthPlan = profile?.healthPlan;

    return this.ok('Athlete profile retrieved successfully', response);
  }
}
