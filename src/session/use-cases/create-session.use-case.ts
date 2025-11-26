import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { CreateSessionDto } from '@/session/dtos/create-session.dto';
import { SessionResponseDto } from '@/session/dtos/session-response.dto';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';

@Injectable()
export class CreateSessionUseCase extends BaseUseCase<CreateSessionDto, SessionResponseDto> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
  ) { super() }

  async handle(payload: CreateSessionDto, auth: AuthUser): Promise<IUseCaseResponse<SessionResponseDto>> {
    const coachUser = await this.userRepository.findById(auth.id);
    if (!coachUser) throw new UnauthorizedException('User not found');

    if (!auth?.currentActiveSchoolId) throw new UnauthorizedException('No active school');

    const coachMembership = await this.membershipRepository.findByUserIdAndSchoolId(coachUser.id, auth.currentActiveSchoolId);
    if (!coachMembership) throw new UnauthorizedException('User not in active school');

    if (coachMembership.role !== MembershipRole.COACH) throw new UnauthorizedException('User is not a coach');

    const validAthletes = [] as { userId: string; name: string }[];

    for (const athlete of payload.athletes ?? []) {
      const athleteMembership = await this.membershipRepository.findById(athlete.userId);
      if (!athleteMembership || athleteMembership.schoolId !== auth.currentActiveSchoolId) {
        throw new ConflictException(`Athlete not in active school: ${athlete.name}`);
      }
      validAthletes.push({ userId: athlete.userId, name: athlete.name });
    }

    const coach = { userId: coachUser.id, name: coachUser.name };

    const session = await this.sessionRepository.create({
      duration: payload.duration,
      schoolId: auth.currentActiveSchoolId,
      seaConditions: payload.seaConditions,
      waveConditions: payload.waveConditions,
      location: payload.location,
      athletes: validAthletes,
      coach,
    });

    return this.ok('Session created successfully', SessionResponseDto.fromEntity(session));
  }
}
