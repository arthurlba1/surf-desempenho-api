import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteBodyDataResponseDto } from '@/athletes/dtos/athlete-body-data-response.dto';
import { IAthleteBodyDataRepository } from '@/athletes/repositories/athlete-body-data.repository.interface';
import { AthleteBodyDataMapper } from '@/athletes/dtos/athlete-body-data-mapper';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';

@Injectable()
export class GetAthleteBodyDataUseCase extends BaseUseCase<
  { id: string },
  AthleteBodyDataResponseDto
> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
    private readonly bodyDataRepository: IAthleteBodyDataRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {
    super();
  }

  async handle(
    { id }: { id: string },
    auth: AuthUser
  ): Promise<IUseCaseResponse<AthleteBodyDataResponseDto>> {
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
      // Se está em uma sessão mas não existe no banco, retornar dados vazios usando o mapper
      if (isInSession) {
        const emptyBodyData = AthleteBodyDataMapper.toDto(null);
        return this.ok('Athlete body data retrieved successfully (empty - athlete not in database)', emptyBodyData);
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

    // Buscar dados corporais do banco
    const bodyDataEntity = await this.bodyDataRepository.findByAthleteId(id);
    const bodyData = AthleteBodyDataMapper.toDto(bodyDataEntity);

    return this.ok('Athlete body data retrieved successfully', bodyData);
  }
}

