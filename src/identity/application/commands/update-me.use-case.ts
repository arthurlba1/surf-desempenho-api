import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { LoggedUserResponse } from '@/auth/application/responses/logged-user.response';
import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { UserEntity } from '@/identity/domain/entities/user.entity';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { MembershipSchoolMapperService } from '@/school/application/services/membership-school-mapper.service';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { UpdateMeCommand } from '@/identity/application/commands/update-me.command';

@Injectable()
export class UpdateMeUseCase extends BaseUseCase<UpdateMeCommand, LoggedUserResponse> {
  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly membershipSchoolMapper: MembershipSchoolMapperService,
  ) {
    super();
  }

  async handle(payload: UpdateMeCommand, auth?: AuthUser): Promise<IUseCaseResponse<LoggedUserResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const { version, ...rest } = payload;

    const existingUser = await this.userRepository.findById(auth.id);
    if (!existingUser) throw new NotFoundException('User not found');

    if (version !== undefined && existingUser.hasConflict(version)) {
      throw new ConflictException('Version conflict: document was modified by another operation');
    }

    const updatedEntity = UserEntity.create({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      password: existingUser.password,
      role: existingUser.role,
      profilePictureUrl: rest.profilePictureUrl ?? existingUser.profilePictureUrl,
      birthdate: rest.birthdate ?? existingUser.birthdate,
      document: rest.document ?? existingUser.document,
      currentActiveSchoolId: existingUser.currentActiveSchoolId,
      sync: existingUser.sync,
      createdAt: existingUser.createdAt,
      updatedAt: new Date(),
    });

    const updated = await this.userRepository.update(existingUser.id, updatedEntity, version);
    if (!updated) throw new NotFoundException('User not found');

    const memberships = await this.membershipRepository.findByUserId(updated.id);
    const schoolIds = memberships.map((m) => m.schoolId);
    const schools = await this.schoolRepository.findManyByIds(schoolIds);
    const schoolsWithStatus = this.membershipSchoolMapper.mapMembershipsToSchools(memberships, schools);

    const userResponse: LoggedUserResponse = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      profilePictureUrl: updated.profilePictureUrl,
      birthdate: updated.birthdate,
      document: updated.document,
      currentActiveSchoolId: updated.currentActiveSchoolId,
      schools: schoolsWithStatus as any,
    };

    return this.ok('User updated successfully', userResponse);
  }
}
