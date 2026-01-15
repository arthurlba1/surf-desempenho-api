import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { isCoachRole, MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import { GetSchoolOverviewQuery } from '@/school/application/queries/get-school-overview.query';
import { SchoolOverviewResponse } from '@/school/application/responses/school-overview.response';

@Injectable()
export class GetSchoolOverviewUseCase extends BaseUseCase<GetSchoolOverviewQuery, SchoolOverviewResponse> {
  constructor(
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(_payload: GetSchoolOverviewQuery, auth?: AuthUser): Promise<IUseCaseResponse<SchoolOverviewResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const schoolId = auth.currentActiveSchoolId;
    if (!schoolId) {
      throw new BadRequestException('currentActiveSchoolId is required for this operation');
    }

    // Redundant with SchoolContextGuard, but keeps use case safe if reused elsewhere.
    const membership = await this.membershipRepository.findByUserIdAndSchoolId(auth.id, schoolId);
    if (!membership) {
      throw new ForbiddenException('You do not have access to this school');
    }
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException(
        `Your membership is ${membership.status}. Only ACTIVE members can access school operations`,
      );
    }

    const asOf = new Date().toISOString();

    const schoolMemberships = await this.membershipRepository.findBySchoolId(schoolId);

    const totalEnrolled = schoolMemberships.filter(
      (m) => m.role === MembershipRole.SURFER && m.status === MembershipStatus.ACTIVE,
    ).length;

    const totalCoaches = schoolMemberships.filter((m) => isCoachRole(m.role)).length;

    const totalActiveCoaches = schoolMemberships.filter(
      (m) => isCoachRole(m.role) && m.status === MembershipStatus.ACTIVE,
    ).length;
  
    if (membership.role === MembershipRole.SURFER) {
      // TODO(training-session): replace with real participation count
      return this.ok('School overview retrieved successfully', {
        role: 'SURFER',
        asOf,
        coaches: { total: totalCoaches, totalActive: totalActiveCoaches },
        trainingSessions: {
          totalParticipated: 0,
        },
      });
    }

    // TODO(training-session): replace with real school session count
    const totalSessions = 0;

    return this.ok('School overview retrieved successfully', {
      role: 'COACH',
      asOf,
      athletes: { totalEnrolled },
      coaches: { total: totalCoaches, totalActive: totalActiveCoaches },
      trainingSessions: { total: totalSessions },
    });
  }
}
