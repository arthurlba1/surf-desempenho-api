import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteResponseDto } from '@/athletes/dtos/athlete-response.dto';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';

@Injectable()
export class GetAthleteByIdUseCase extends BaseUseCase<{ id: string }, AthleteResponseDto> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {
    super();
  }

  async handle(
    { id }: { id: string },
    auth: AuthUser
  ): Promise<IUseCaseResponse<AthleteResponseDto>> {
    const { currentActiveSchoolId } = auth;
    if (!currentActiveSchoolId) {
      throw new UnauthorizedException('User not authenticated or no active school');
    }

    // Primeiro verificar se está em alguma sessão da escola (para permitir atletas que podem não ter membership ativo)
    const sessions = await this.sessionRepository.findAllBySchoolId(currentActiveSchoolId, {
      athleteUserId: id,
    });
    
    const isInSession = sessions.length > 0;
    let sessionAthlete: { userId: string; name: string; profilePictureUrl?: string } | null = null;
    
    if (isInSession) {
      // Buscar dados do atleta na sessão
      for (const session of sessions) {
        const athlete = session.athletes?.find(a => a.userId === id);
        if (athlete) {
          sessionAthlete = {
            userId: athlete.userId,
            name: athlete.name,
            profilePictureUrl: athlete.profilePictureUrl,
          };
          break;
        }
      }
    }

    // Verificar se o usuário existe e é um SURFER
    const user = await this.userRepository.findById(id);
    if (!user || user.role !== UserRole.SURFER) {
      // Se está em uma sessão mas não existe mais no banco, retornar dados básicos da sessão
      if (isInSession && sessionAthlete) {
        const basicAthlete = new AthleteResponseDto();
        basicAthlete.id = sessionAthlete.userId;
        basicAthlete.name = sessionAthlete.name;
        basicAthlete.status = 'Cliente ativo';
        basicAthlete.avatarUrl = sessionAthlete.profilePictureUrl;
        basicAthlete.lastSessionDate = undefined;
        return this.ok('Athlete retrieved successfully (from session)', basicAthlete);
      }
      throw new NotFoundException('Athlete not found');
    }

    // Verificar se o surfer pertence à escola ativa do coach
    const membership = await this.membershipRepository.findByUserIdAndSchoolId(
      id,
      currentActiveSchoolId
    );

    // Se não tem membership ativo, mas está em uma sessão, permitir acesso
    if (!membership || membership.role !== MembershipRole.SURFER || !membership.isActive) {
      if (!isInSession) {
        throw new NotFoundException('Athlete not found in your active school');
      }
    }

    return this.ok('Athlete retrieved successfully', AthleteResponseDto.fromEntity(user));
  }
}

