import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { UpdateSessionDto } from '@/session/dtos/update-session.dto';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { SessionResponseDto } from '@/session/dtos/session-response.dto';

@Injectable()
export class UpdateSessionUseCase extends BaseUseCase<UpdateSessionDto & { id: string }, any> {
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
      for (const athlete of payload.athletes) {
        const membership = await this.membershipRepository.findById(athlete.userId);
        if (!membership || membership.schoolId !== auth.currentActiveSchoolId) {
          throw new ConflictException(`Athlete not in active school: ${athlete.name}`);
        }
        session.athletes?.push({ userId: membership.id, name: athlete.name });
      }
    }

    const updated = await this.sessionRepository.update(payload.id, {
      ...payload,
      duration: payload.duration ?? session.duration,
      schoolId: auth.currentActiveSchoolId,
      athletes: session.athletes,
    });
    if (!updated) throw new ConflictException('Session not found');

    return this.ok('Session updated successfully', SessionResponseDto.fromEntity(updated));
  }
}
