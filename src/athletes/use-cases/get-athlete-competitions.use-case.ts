import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteCompetitionResponseDto } from '@/athletes/dtos/athlete-competition-response.dto';
import { IAthleteCompetitionRepository } from '@/athletes/repositories/athlete-competition.repository.interface';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';

@Injectable()
export class GetAthleteCompetitionsUseCase extends BaseUseCase<
  { id: string },
  AthleteCompetitionResponseDto[]
> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
    private readonly competitionRepository: IAthleteCompetitionRepository,
    private readonly sessionRepository: ISessionRepository,
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

    // Verificar se está em alguma sessão da escola primeiro
    const sessions = await this.sessionRepository.findAllBySchoolId(currentActiveSchoolId, {
      athleteUserId: id,
    });
    const isInSession = sessions.length > 0;

    // Verificar se o usuário existe e é um SURFER
    const user = await this.userRepository.findById(id);
    if (!user || user.role !== UserRole.SURFER) {
      // Se está em uma sessão mas não existe no banco, retornar dados vazios
      if (isInSession) {
        return this.ok('Athlete competitions retrieved successfully (empty - athlete not in database)', []);
      }
      throw new NotFoundException('Athlete not found');
    }

    // Verificar se o surfer pertence à escola ativa do coach
    const membership = await this.membershipRepository.findByUserIdAndSchoolId(
      id,
      currentActiveSchoolId
    );

    // Se não tem membership ativo, verificar se está em alguma sessão da escola
    if (!membership || membership.role !== MembershipRole.SURFER || !membership.isActive) {
      // Se não está em nenhuma sessão da escola, retornar erro
      if (!isInSession) {
        throw new NotFoundException('Athlete not found in your active school');
      }
    }

    // Buscar competições do banco
    const competitionEntities = await this.competitionRepository.findByAthleteId(id);
    const competitions = competitionEntities.map((entity) =>
      plainToInstance(AthleteCompetitionResponseDto, {
        name: entity.name,
        date: entity.date,
        location: entity.location,
        association: entity.association,
        placement: entity.placement,
        prize: entity.prize,
        equipment: entity.equipment,
      }, {
        excludeExtraneousValues: true,
      })
    );

    return this.ok('Athlete competitions retrieved successfully', competitions);
  }
}

