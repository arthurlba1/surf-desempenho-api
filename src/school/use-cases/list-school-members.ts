import { Injectable, UnauthorizedException } from "@nestjs/common";

import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { AuthUser } from "@/common/types/auth.types";
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";
import { ListMembershipsResponseDto } from "@/school/dtos/list-memberships-response.dto";
import { IUserRepository } from "@/users/repositories/user.repository.interface";
import { queueScheduler } from "rxjs";


@Injectable()
export class ListSchoolMembersUseCase extends BaseUseCase<unknown, ListMembershipsResponseDto[]> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
  ) { super() }

  async handle(_, auth: AuthUser): Promise<IUseCaseResponse<ListMembershipsResponseDto[]>> {
    const { currentActiveSchoolId } = auth;
    if (!currentActiveSchoolId) throw new UnauthorizedException('User not authenticated');

    const user = await this.userRepository.findById(auth.id);
    if (!user) throw new UnauthorizedException('User not authenticated');queueScheduler


    const results = await this.membershipRepository.findBySchoolId(currentActiveSchoolId);
    return this.ok('School members listed successfully', ListMembershipsResponseDto.fromEntities(results));
  }
}
