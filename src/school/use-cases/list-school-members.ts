import { Injectable, UnauthorizedException } from "@nestjs/common";

import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { AuthUser } from "@/common/types/auth.types";
import { ListSchoolMembersResponseDto } from '@/common/dtos/list-school-members-response.dto';
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";
import { ListSchoolMembersDto } from "@/school/dtos/list-school-members.dto";
import { IUserRepository } from "@/users/repositories/user.repository.interface";
import { queueScheduler } from "rxjs";

@Injectable()
export class ListSchoolMembersUseCase extends BaseUseCase<ListSchoolMembersDto, ListSchoolMembersResponseDto[]> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
  ) { super() }

  async handle(payload: ListSchoolMembersDto, auth: AuthUser): Promise<IUseCaseResponse<ListSchoolMembersResponseDto[]>> {
    const { schoolId } = payload;

    const user = await this.userRepository.findById(auth.id);
    if (!user) throw new UnauthorizedException('User not authenticated');queueScheduler


    const results = await this.membershipRepository.findMembersWithUserNameBySchoolId(schoolId);
    return this.ok('School members listed successfully', results);
  }
}
