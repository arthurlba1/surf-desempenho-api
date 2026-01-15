import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthResponse } from '@/auth/application/responses/auth.response';
import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { MembershipSchoolMapperService } from '@/school/application/services/membership-school-mapper.service';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { MembershipStatus } from '@/school/schemas/membership.schema';

import { SwitchActiveSchoolCommand } from '@/auth/application/commands/switch-active-school.command';

@Injectable()
export class SwitchActiveSchoolUseCase extends BaseUseCase<SwitchActiveSchoolCommand, AuthResponse> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly membershipSchoolMapper: MembershipSchoolMapperService,
  ) {
    super();
  }

  async handle(payload: SwitchActiveSchoolCommand, auth?: AuthUser): Promise<IUseCaseResponse<AuthResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const { schoolId } = payload;

    const membership = await this.membershipRepository.findByUserIdAndSchoolId(auth.id, schoolId);
    if (!membership) throw new ForbiddenException('You do not have access to this school');

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException(
        `Your membership is ${membership.status}. Only ACTIVE members can switch to this school`,
      );
    }

    const updatedUser = await this.userRepository.setCurrentActiveSchoolId(auth.id, schoolId);
    if (!updatedUser) throw new NotFoundException('User not found');

    const accessToken = this.jwtService.sign({
      id: updatedUser.id,
      email: updatedUser.email,
      currentActiveSchoolId: updatedUser.currentActiveSchoolId,
    });

    // return full logged user snapshot (same shape as login/register)
    const memberships = await this.membershipRepository.findByUserId(updatedUser.id);
    const schoolIds = memberships.map((m) => m.schoolId);
    const schools = await this.schoolRepository.findManyByIds(schoolIds);
    const schoolsWithStatus = this.membershipSchoolMapper.mapMembershipsToSchools(memberships, schools);

    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePictureUrl: updatedUser.profilePictureUrl,
      birthdate: updatedUser.birthdate,
      document: updatedUser.document,
      currentActiveSchoolId: updatedUser.currentActiveSchoolId,
      schools: schoolsWithStatus,
    };

    return this.ok('Active school updated successfully', AuthResponse.from(accessToken, userResponse as any));
  }
}
