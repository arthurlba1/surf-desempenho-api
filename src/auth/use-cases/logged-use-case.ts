import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import { IUseCaseResponse } from "@/common/types/use-case-response";
import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { IUserRepository } from "@/users/repositories/user.repository.interface";
import { AuthUser } from "@/common/types/auth.types";
import { UserResponseDto } from "@/users/dtos/user-response.dto";
import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";

@Injectable()
export class LoggedUseCase extends BaseUseCase<{}, UserResponseDto> {
  constructor(private readonly userRepository: IUserRepository, private readonly membershipRepository: IMembershipRepository) { super() }

  async handle(_payload: unknown, auth: AuthUser): Promise<IUseCaseResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(auth.id);
    if (!user) throw new ConflictException('User not found');

    const userPlain = typeof (user as any)?.toObject === 'function' ? (user as any).toObject() : user;

    const membershipsWithSchool = await this.membershipRepository.findByUserIdWithSchoolName(user.id);

    const activeSchoolsEnriched = (membershipsWithSchool ?? []).map((m: any) => ({
      schoolId: String(m.schoolId),
      role: m.role,
      isActive: m.isActive,
      schoolName: m.schoolName ?? null,
    }));

    return this.ok('User fetched successfully', UserResponseDto.fromEntity({
      ...userPlain,
      activeSchools: activeSchoolsEnriched,
    } as any));
  }
}
