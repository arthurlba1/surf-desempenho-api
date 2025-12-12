import { Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { ISessionRepository, ListSessionsFilters } from '@/session/repositories/session.repository.interface';
import { SessionSummaryDto } from '@/session/dtos/session-summary.dto';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { MembershipRole, isCoachRole } from '@/memberships/schemas/membership.schema';
import { ISchoolRepository } from '@/school/repositories/school.repository.interface';

export type ListSessionsDetail = {
  sessions: SessionSummaryDto[];
};

@Injectable()
export class ListSessionsUseCase extends BaseUseCase<void, ListSessionsDetail> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly schoolRepository: ISchoolRepository,
  ) { super() }

  async handle(_: void, auth: AuthUser): Promise<IUseCaseResponse<ListSessionsDetail>> {
    if (!auth?.currentActiveSchoolId) {
      throw new UnauthorizedException('No active school');
    }

    const [membership, school] = await Promise.all([
      this.membershipRepository.findByUserIdAndSchoolId(auth.id, auth.currentActiveSchoolId),
      this.schoolRepository.findById(auth.currentActiveSchoolId),
    ]);

    if (!school) {
      throw new UnauthorizedException('School not found');
    }

    const isSchoolOwner = (() => {
      const ownerId = typeof (school.owner as any)?.toString === 'function'
        ? (school.owner as any).toString()
        : school.owner;
      return ownerId === auth.id;
    })();

    const filters: ListSessionsFilters | undefined = (() => {
      if (isSchoolOwner) return undefined;
      if (!membership || membership.isActive === false) {
        throw new UnauthorizedException('Membership not found or inactive');
      }

      if (isCoachRole(membership.role)) {
        return { coachUserId: auth.id };
      }

      if (membership.role === MembershipRole.SURFER) {
        return { athleteUserId: auth.id };
      }

      throw new UnauthorizedException('User not allowed to list sessions');
    })();

    const sessions = await this.sessionRepository.findAllBySchoolId(auth.currentActiveSchoolId, filters);

    return this.ok('Sessions fetched successfully', {
      sessions: SessionSummaryDto.fromEntities(sessions),
    });
  }
}
