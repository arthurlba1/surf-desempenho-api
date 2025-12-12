import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";

import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { type AuthUser } from "@/common/types/auth.types";
import { type IUseCaseResponse } from "@/common/types/use-case-response";

import { UserResponseDto } from "@/users/dtos/user-response.dto";
import { IUserRepository } from "@/users/repositories/user.repository.interface";
import { AssociateUserToSchoolDto } from "@/users/dtos/associate-user-to-school.dto";
import { MembershipRole } from "@/memberships/schemas/membership.schema";
import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";
import { ISchoolRepository } from "@/school/repositories/school.repository.interface";
import { UserRole } from "@/users/types/user-role.type";

@Injectable()
export class AssociateUserToSchoolUseCase extends BaseUseCase<AssociateUserToSchoolDto, UserResponseDto> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly schoolRepository: ISchoolRepository,
    private readonly userRepository: IUserRepository,
  ) { super() }

  async handle(payload: AssociateUserToSchoolDto, auth: AuthUser): Promise<IUseCaseResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(auth.id);
    if (!user) throw new UnauthorizedException('User not authenticated');

    const existingMembership = await this.membershipRepository.findByUserIdAndSchoolId(user.id, payload.schoolId);
    if (existingMembership) throw new ConflictException('User already associated to this school');

    const school = await this.schoolRepository.findById(payload.schoolId);
    if (!school) throw new ConflictException('School not found');

    await this.userRepository.setCurrentActiveSchoolId(user.id, payload.schoolId);
    
    // Map UserRole to MembershipRole
    let membershipRole: MembershipRole;
    if (user.role === UserRole.HEADCOACH) {
      membershipRole = MembershipRole.HEADCOACH;
    } else if (user.role === UserRole.COACH) {
      membershipRole = MembershipRole.COACH;
    } else if (user.role === UserRole.SURFER) {
      membershipRole = MembershipRole.SURFER;
    } else {
      throw new ConflictException('Invalid user role for membership');
    }
    
    await this.membershipRepository.create({
      userId: user.id,
      schoolId: school.id,
      role: membershipRole,
    } as any);

    return this.ok('User associated to school successfully', UserResponseDto.fromEntity(user));
  }
}
