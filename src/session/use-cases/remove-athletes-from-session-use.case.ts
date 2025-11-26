import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { UpdateSessionDto } from '@/session/dtos/update-session.dto';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { DeleteAthletesDto } from '@/session/dtos/delete-athletes.dto';

@Injectable()
export class RemoveAthletesFromSession extends BaseUseCase<DeleteAthletesDto & { id: string }, any> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) { super() }

  async handle(payload: UpdateSessionDto & { id: string }, auth: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth?.currentActiveSchoolId) throw new UnauthorizedException('No active school');

    const session = await this.sessionRepository.findById(payload.id);
    if (!session || session.schoolId !== auth.currentActiveSchoolId) {
      throw new ConflictException('Session not found');
    }

    if (payload.athletes) {
      const memberships = await Promise.all(
        payload.athletes.map((a) =>
          this.membershipRepository.findById(a.userId),
        ),
      );

      const validIdsToRemove = memberships
        .filter(
          (membership) =>
            membership && membership?.schoolId === auth.currentActiveSchoolId,
        )
        .map((membership) => membership?.id);

      if (validIdsToRemove.length === 0) {
        throw new ConflictException('No valid athletes to remove');
      }

      session.athletes = session.athletes?.filter(
        (athlete) => !validIdsToRemove.includes(athlete.userId),
      );
    }

    const updated = await this.sessionRepository.update(payload.id, {
      athletes: session.athletes,
    });

    if (!updated) throw new ConflictException('Session not found');

    return this.ok('Athletes removed from session successfully', updated);
  }
}
