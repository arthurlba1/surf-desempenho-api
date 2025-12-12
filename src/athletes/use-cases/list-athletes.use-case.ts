import { Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteResponseDto } from '@/athletes/dtos/athlete-response.dto';

@Injectable()
export class ListAthletesUseCase extends BaseUseCase<unknown, AthleteResponseDto[]> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async handle(_, auth: AuthUser): Promise<IUseCaseResponse<AthleteResponseDto[]>> {
    const { currentActiveSchoolId } = auth;
    if (!currentActiveSchoolId) {
      throw new UnauthorizedException('User not authenticated or no active school');
    }

    // Buscar todos os membros SURFER da escola ativa
    const memberships = await this.membershipRepository.findBySchoolId(currentActiveSchoolId);
    const surferMemberships = memberships.filter(
      (m: any) => m.role === MembershipRole.SURFER && m.isActive
    );

    // Buscar os usuários correspondentes usando os IDs dos membros
    const athletes = await Promise.all(
      surferMemberships.map(async (membership: any) => {
        const userId = membership.user?.id || membership.userId;
        if (!userId) return null;
        const user = await this.userRepository.findById(userId);
        return user;
      })
    );

    // Filtrar nulls e garantir que são SURFERs
    const validAthletes = athletes.filter(
      (user) => user && user.role === UserRole.SURFER
    ) as any[];

    return this.ok(
      'Athletes listed successfully',
      AthleteResponseDto.fromEntities(validAthletes)
    );
  }
}

