import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { AuthUser } from '@/common/types/auth.types';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { IMembershipRepository } from '@/memberships/repositories/membership.repository.interface';
import { IUserRepository } from '@/users/repositories/user.repository.interface';
import { UserRole } from '@/users/types/user-role.type';
import { MembershipRole } from '@/memberships/schemas/membership.schema';
import { AthleteEquipmentResponseDto } from '@/athletes/dtos/athlete-equipment-response.dto';
import { IAthleteEquipmentRepository } from '@/athletes/repositories/athlete-equipment.repository.interface';
import { EquipmentType } from '@/athletes/schemas/athlete-equipment.schema';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';

@Injectable()
export class GetAthleteEquipmentUseCase extends BaseUseCase<
  { id: string },
  { [key: string]: AthleteEquipmentResponseDto[] }
> {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly userRepository: IUserRepository,
    private readonly equipmentRepository: IAthleteEquipmentRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {
    super();
  }

  async handle(
    { id }: { id: string },
    auth: AuthUser
  ): Promise<IUseCaseResponse<{ [key: string]: AthleteEquipmentResponseDto[] }>> {
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
        const emptyEquipment: { [key: string]: AthleteEquipmentResponseDto[] } = {
          cpq: [],
          boards: [],
          fins: [],
        };
        return this.ok('Athlete equipment retrieved successfully (empty - athlete not in database)', emptyEquipment);
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

    // Buscar equipamentos do banco
    const equipmentEntities = await this.equipmentRepository.findByAthleteId(id);
    
    // Agrupar por tipo
    const equipment: { [key: string]: AthleteEquipmentResponseDto[] } = {
      cpq: [],
      boards: [],
      fins: [],
    };

    equipmentEntities.forEach((item) => {
      const dto = plainToInstance(AthleteEquipmentResponseDto, {
        name: item.name,
        description: item.description,
        date: item.date,
      }, {
        excludeExtraneousValues: true,
      });

      if (item.type === EquipmentType.CPQ) {
        equipment.cpq.push(dto);
      } else if (item.type === EquipmentType.BOARDS) {
        equipment.boards.push(dto);
      } else if (item.type === EquipmentType.FINS) {
        equipment.fins.push(dto);
      }
    });

    return this.ok('Athlete equipment retrieved successfully', equipment);
  }
}

