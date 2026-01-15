import { NotFoundException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AddMemberToSchoolCommand } from './add-member-to-school.command';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { SchoolEntity } from '@/school/domain/entities/school.entity';
import { CreateMembershipUseCase } from '@/school/application/commands/create-membership.use-case';
import { CreateMembershipCommand } from '@/school/application/commands/create-membership.command';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import { UserRole } from '@/common/types/user-role.types';

@Injectable()
export class AddMemberToSchoolUseCase extends BaseUseCase<AddMemberToSchoolCommand, SchoolEntity> {
  constructor(
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly createMembershipUseCase: CreateMembershipUseCase,
  ) {
    super();
  }

  async handle(payload: AddMemberToSchoolCommand): Promise<IUseCaseResponse<SchoolEntity>> {
    const school = await this.schoolRepository.findById(payload.schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    let membershipRole: MembershipRole;
    if (payload.role === UserRole.COACH) {
      membershipRole = MembershipRole.COACH;
    } else if (payload.role === UserRole.SURFER) {
      membershipRole = MembershipRole.SURFER;
    } else {
      throw new NotFoundException('Invalid role. Must be COACH or SURFER');
    }

    const createMembershipCommand: CreateMembershipCommand = {
      userId: payload.userId,
      schoolId: payload.schoolId,
      role: membershipRole,
      status: MembershipStatus.PENDING,
    };
    await this.createMembershipUseCase.handle(createMembershipCommand);

    return this.ok('Member added to school successfully', school);
  }
}
