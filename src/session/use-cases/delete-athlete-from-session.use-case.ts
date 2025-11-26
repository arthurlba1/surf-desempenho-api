import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { SessionResponseDto } from '@/session/dtos/session-response.dto';

type DeleteAthletePayload = {
  sessionId: string;
  athleteMembershipId: string;
};

@Injectable()
export class DeleteAthleteFromSessionUseCase extends BaseUseCase<DeleteAthletePayload, SessionResponseDto> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) { super() }

  async handle(payload: DeleteAthletePayload, auth: AuthUser): Promise<IUseCaseResponse<SessionResponseDto>> {
    const { sessionId, athleteMembershipId } = payload;

    if (!auth?.currentActiveSchoolId) throw new UnauthorizedException('No active school');

    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.schoolId !== auth.currentActiveSchoolId) {
      throw new ConflictException('Session not found');
    }

    const membership = await this.membershipRepository.findById(athleteMembershipId);
    if (!membership || membership.schoolId !== auth.currentActiveSchoolId) {
      throw new ConflictException('Athlete not in active school');
    }

    const athletes = session.athletes ?? [];
    const updatedAthletes = athletes
      .filter(athlete => athlete.userId !== athleteMembershipId)
      .map(athlete => ({
        userId: athlete.userId,
        name: athlete.name,
      }));

    if (updatedAthletes.length === athletes.length) {
      throw new ConflictException('Athlete not in session');
    }

    const updated = await this.sessionRepository.update(sessionId, { athletes: updatedAthletes });
    if (!updated) throw new ConflictException('Session not found');

    const reloadedSession = await this.sessionRepository.findById(sessionId);
    if (!reloadedSession) throw new ConflictException('Session not found');

    return this.ok('Athlete removed from session successfully', SessionResponseDto.fromEntity(reloadedSession));
  }
}

