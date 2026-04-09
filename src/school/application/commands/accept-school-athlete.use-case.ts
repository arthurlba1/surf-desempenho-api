import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import type { AcceptSchoolAthleteCommand } from './accept-school-athlete.command';
import { MembershipEntity } from '@/school/domain/entities/membership.entity';

@Injectable()
export class AcceptSchoolAthleteUseCase extends BaseUseCase<AcceptSchoolAthleteCommand, MembershipEntity> {
  constructor(private readonly membershipRepository: IMembershipRepositoryPort) {
    super();
  }

  async handle(payload: AcceptSchoolAthleteCommand, auth?: AuthUser): Promise<IUseCaseResponse<MembershipEntity>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const schoolId = auth.currentActiveSchoolId;
    if (!schoolId) {
      throw new BadRequestException('currentActiveSchoolId is required for this operation');
    }

    const userId = payload.userId?.trim();
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const requesterMembership = await this.membershipRepository.findByUserIdAndSchoolId(auth.id, schoolId);
    if (!requesterMembership || requesterMembership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException('You do not have access to this school');
    }
    if (![MembershipRole.COACH, MembershipRole.HEADCOACH].includes(requesterMembership.role)) {
      throw new ForbiddenException('Only coaches can accept athletes');
    }

    const athleteMembership = await this.membershipRepository.findByUserIdAndSchoolId(userId, schoolId);
    if (!athleteMembership) {
      throw new NotFoundException('Athlete membership not found in this school');
    }
    if (athleteMembership.role !== MembershipRole.SURFER) {
      throw new ForbiddenException('Only surfer memberships can be accepted');
    }

    if (athleteMembership.status === MembershipStatus.ACTIVE) {
      return this.ok('Athlete is already active', athleteMembership);
    }
    if (athleteMembership.status !== MembershipStatus.PENDING) {
      throw new ForbiddenException(`Cannot accept athlete with status ${athleteMembership.status}`);
    }

    // MembershipRepository.update() increments version + marks synced; avoid markAsActive() double bump.
    athleteMembership.status = MembershipStatus.ACTIVE;

    const updated = await this.membershipRepository.update(athleteMembership.id, athleteMembership);
    if (!updated) {
      throw new NotFoundException('Membership not found');
    }

    return this.ok('Athlete accepted successfully', updated);
  }
}
