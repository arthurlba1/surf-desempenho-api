import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { LoginQuery } from './login.query';
import { AuthResponse } from '@/auth/application/responses/auth.response';
import { GetUserLoginByEmailUseCase } from '@/identity/application/queries/get-user-by-email.use-case';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { MembershipSchoolMapperService } from '@/school/application/services/membership-school-mapper.service';

@Injectable()
export class LoginUseCase extends BaseUseCase<LoginQuery, AuthResponse> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly GetUserLoginByEmailUseCase: GetUserLoginByEmailUseCase,
    private readonly membershipRepository: IMembershipRepositoryPort,
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly membershipSchoolMapper: MembershipSchoolMapperService,
  ) {
    super();
  }

  async handle(payload: LoginQuery): Promise<IUseCaseResponse<AuthResponse>> {
    const { email, password } = payload;

    const userResult = await this.GetUserLoginByEmailUseCase.handle({ email });
    const user = userResult.detail!;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ConflictException('Email or password is incorrect');
    }

    const accessToken = this.generateToken({
      id: user.id,
      email: user.email,
      currentActiveSchoolId: user.currentActiveSchoolId,
    });

    const memberships = await this.membershipRepository.findByUserId(user.id);
    const schoolIds = memberships.map(membership => membership.schoolId);
    const schools = await this.schoolRepository.findManyByIds(schoolIds);
    const schoolsWithStatus = this.membershipSchoolMapper.mapMembershipsToSchools(memberships, schools);

    //TODO: Refactor this to use the UserResponseDto to simple call -> AuthResponse.from(accessToken, UserResponseDto.fromEntity(user));
    const userResponse = {
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

    return this.ok('User logged in successfully', AuthResponse.from(accessToken, userResponse));
  }

  private generateToken(payload: { id: string; email: string; currentActiveSchoolId?: string }): string {
    return this.jwtService.sign(payload);
  }
}
