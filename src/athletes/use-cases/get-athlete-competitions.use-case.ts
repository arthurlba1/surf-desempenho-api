import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteCompetitionResponseDto } from '@/athletes/dtos/athlete-competition-response.dto';

@Injectable()
export class GetAthleteCompetitionsUseCase extends BaseUseCase<
  { id: string },
  AthleteCompetitionResponseDto[]
> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async handle(
    { id }: { id: string },
    auth: AuthUser
  ): Promise<IUseCaseResponse<AthleteCompetitionResponseDto[]>> {
    const { currentActiveSchoolId } = auth;
    if (!currentActiveSchoolId) {
      throw new UnauthorizedException('User not authenticated or no active school');
    }

    // Verificar se o usuário existe e é um SURFER
    const user = await this.userRepository.findById(id);
    if (!user || user.role !== UserRole.SURFER) {
      throw new NotFoundException('Athlete not found');
    }

    // Verificar se o surfer pertence à escola ativa do coach
    const membership = await this.membershipRepository.findByUserIdAndSchoolId(
      id,
      currentActiveSchoolId
    );

    if (!membership || membership.role !== MembershipRole.SURFER || !membership.isActive) {
      throw new NotFoundException('Athlete not found in your active school');
    }

    // TODO: Buscar competições reais quando o schema for criado
    // Por enquanto retorna array vazio
    const competitions: AthleteCompetitionResponseDto[] = [];

    return this.ok('Athlete competitions retrieved successfully', competitions);
  }
}

