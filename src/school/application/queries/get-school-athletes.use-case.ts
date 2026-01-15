import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import { GetSchoolAthletesQuery, type SchoolAthletesStatusFilter } from '@/school/application/queries/get-school-athletes.query';
import { SchoolAthleteResponse } from '@/school/application/responses/school-athlete.response';

function normalizeStatusFilter(input?: string): SchoolAthletesStatusFilter {
  const value = (input ?? 'ALL').toUpperCase();
  if (value === 'ACTIVE' || value === 'PENDING' || value === 'BLOCKED' || value === 'INACTIVE' || value === 'ALL') {
    return value as SchoolAthletesStatusFilter;
  }
  throw new BadRequestException(`Invalid status filter: ${input}`);
}

@Injectable()
export class GetSchoolAthletesUseCase extends BaseUseCase<GetSchoolAthletesQuery, SchoolAthleteResponse[]> {
  constructor(
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly userRepository: IUserRepositoryPort,
  ) {
    super();
  }

  async handle(payload: GetSchoolAthletesQuery, auth?: AuthUser): Promise<IUseCaseResponse<SchoolAthleteResponse[]>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const schoolId = auth.currentActiveSchoolId;
    if (!schoolId) {
      throw new BadRequestException('currentActiveSchoolId is required for this operation');
    }

    // Redundant with guard, but safe if reused
    const requesterMembership = await this.membershipRepository.findByUserIdAndSchoolId(auth.id, schoolId);
    if (!requesterMembership) {
      throw new ForbiddenException('You do not have access to this school');
    }
    if (requesterMembership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException(
        `Your membership is ${requesterMembership.status}. Only ACTIVE members can access school operations`,
      );
    }
    if (requesterMembership.role !== MembershipRole.COACH && requesterMembership.role !== MembershipRole.HEADCOACH) {
      throw new ForbiddenException('Only coaches can access athletes management');
    }

    const status = normalizeStatusFilter(payload?.status);

    const memberships = await this.membershipRepository.findBySchoolId(schoolId);
    const surferMemberships = memberships.filter((m) => m.role === MembershipRole.SURFER);

    const filtered = surferMemberships.filter((m) => {
      if (status === 'ALL') return true;
      if (status === 'INACTIVE') return m.status === MembershipStatus.PENDING || m.status === MembershipStatus.BLOCKED;
      return m.status === status;
    });

    const userIds = filtered.map((m) => m.userId);
    const users = await this.userRepository.findManyByIds(userIds);
    const usersById = new Map(users.map((u) => [u.id, u]));

    const response: SchoolAthleteResponse[] = filtered.map((membership) => {
      const user = usersById.get(membership.userId);
      return {
        id: membership.userId,
        name: user?.name ?? 'Unknown',
        profilePictureUrl: user?.profilePictureUrl ?? null,
        membershipStatus: membership.status,
        // TODO(training-session): replace with real participation count (read model)
        sessionsParticipatedTotal: 0,
      };
    });

    return this.ok('Athletes retrieved successfully', response);
  }
}
