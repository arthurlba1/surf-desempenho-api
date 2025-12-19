import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteSurftripResponseDto } from '@/athletes/dtos/athlete-surftrip-response.dto';
import { IAthleteSurftripRepository } from '@/athletes/repositories/athlete-surftrip.repository.interface';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';

@Injectable()
export class GetAthleteSurftripsUseCase extends BaseUseCase<
  { id: string },
  AthleteSurftripResponseDto[]
> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
    private readonly surftripRepository: IAthleteSurftripRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {
    super();
  }

  async handle(
    { id }: { id: string },
    auth: AuthUser
  ): Promise<IUseCaseResponse<AthleteSurftripResponseDto[]>> {
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
        return this.ok('Athlete surftrips retrieved successfully (empty - athlete not in database)', []);
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

    // Buscar surftrips do banco
    const surftripEntities = await this.surftripRepository.findByAthleteId(id);
    const surftrips = surftripEntities.map((entity) =>
      plainToInstance(AthleteSurftripResponseDto, {
        name: entity.name,
        dateStart: entity.dateStart,
        dateEnd: entity.dateEnd,
        location: entity.location,
        quiver: entity.quiver,
        physicalPerformance: entity.physicalPerformance,
        technicalPerformance: entity.technicalPerformance,
        equipmentPerformance: entity.equipmentPerformance,
        planning: entity.planning,
        accumulatedCompetencies: entity.accumulatedCompetencies,
        coachFollowUp: entity.coachFollowUp,
      }, {
        excludeExtraneousValues: true,
      })
    );

    return this.ok('Athlete surftrips retrieved successfully', surftrips);
  }
}

