import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { GetUserByIdUseCase } from '@/identity/application/queries/get-user-by-id.use-case';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { MembershipSchoolMapperService } from '@/school/application/services/membership-school-mapper.service';
import { LoggedUserResponse } from '@/auth/application/responses/logged-user.response';

@Injectable()
export class GetLoggedUserUseCase extends BaseUseCase<{}, LoggedUserResponse> {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly membershipSchoolMapper: MembershipSchoolMapperService,
  ) {
    super();
  }

  async handle(_payload: unknown, auth: AuthUser): Promise<IUseCaseResponse<LoggedUserResponse>> {
    const userResult = await this.getUserByIdUseCase.handle({ id: auth.id });
    const user = userResult.detail!;

    const memberships = await this.membershipRepository.findByUserId(user.id);
    
    const schoolIds = memberships.map(membership => membership.schoolId);
    const schools = await this.schoolRepository.findManyByIds(schoolIds);

    // Map memberships to schools with status
    const schoolsWithStatus = this.membershipSchoolMapper.mapMembershipsToSchools(memberships, schools);

    const userResponse: LoggedUserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
      birthdate: user.birthdate,
      document: user.document,
      currentActiveSchoolId: user.currentActiveSchoolId,
      schools: schoolsWithStatus,
    };

    return this.ok('User fetched successfully', userResponse);
  }
}
