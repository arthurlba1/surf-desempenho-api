import { ConflictException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { CreateMembershipCommand } from './create-membership.command';
import { MembershipEntity } from '@/school/domain/entities/membership.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipStatus } from '@/school/schemas/membership.schema';

@Injectable()
export class CreateMembershipUseCase extends BaseUseCase<CreateMembershipCommand, MembershipEntity> {
  constructor(private readonly membershipRepository: IMembershipRepositoryPort) {
    super();
  }

  async handle(payload: CreateMembershipCommand): Promise<IUseCaseResponse<MembershipEntity>> {
    const existing = await this.membershipRepository.findByUserIdAndSchoolId(
      payload.userId,
      payload.schoolId
    );

    if (existing) {
      throw new ConflictException('User is already a member of this school');
    }

    const membership = MembershipEntity.create({
      userId: payload.userId,
      schoolId: payload.schoolId,
      role: payload.role,
      status: payload.status || MembershipStatus.PENDING,
    });

    const created = await this.membershipRepository.create(membership);

    return this.ok('Membership created successfully', created);
  }
}
