import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { UserRole } from '@/common/types/user-role.types';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { MembershipEntity } from '@/school/domain/entities/membership.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import { JoinSchoolInviteCommand } from '@/school/application/commands/join-school-invite.command';

@Injectable()
export class JoinSchoolInviteUseCase extends BaseUseCase<JoinSchoolInviteCommand, MembershipEntity> {
  constructor(
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly userRepository: IUserRepositoryPort,
  ) {
    super();
  }

  async handle(payload: JoinSchoolInviteCommand, auth: AuthUser): Promise<IUseCaseResponse<MembershipEntity>> {
    const trimmed = payload.token?.trim() ?? '';
    let school = await this.schoolRepository.findByInviteToken(trimmed);
    if (!school) {
      // TEMPORARY: also accept short school code (same join semantics as invite token).
      school = await this.schoolRepository.findByTempJoinCode(trimmed);
    }
    if (!school) {
      throw new NotFoundException('Invalid invite token or school code');
    }

    const user = await this.userRepository.findById(auth.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.membershipRepository.findByUserIdAndSchoolId(user.id, school.id);
    if (existing) {
      return this.ok('Membership already exists', existing);
    }

    const membershipRole =
      user.role === UserRole.COACH ? MembershipRole.COACH : MembershipRole.SURFER;

    const membership = MembershipEntity.create({
      userId: user.id,
      schoolId: school.id,
      role: membershipRole,
      status: MembershipStatus.PENDING,
    });

    const created = await this.membershipRepository.create(membership);
    return this.ok('Join request created successfully', created);
  }
}
