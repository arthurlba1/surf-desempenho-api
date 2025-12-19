import { plainToInstance } from 'class-transformer';
import { AthleteBodyDataResponseDto } from '@/athletes/dtos/athlete-body-data-response.dto';
import { AthleteBodyDataDocument } from '@/athletes/schemas/athlete-body-data.schema';

export class AthleteBodyDataMapper {
  static toDto(entity: AthleteBodyDataDocument | null): AthleteBodyDataResponseDto {
    // Criar um objeto base com todos os campos como null
    const baseData = {
      weight: null,
      height: null,
      footSize: null,
      predominantStance: null,
      swimmingProficiency: null,
      surfingStart: null,
      emergencyProficiency: null,
      emergencyContact: null,
      healthPlan: null,
    };

    if (!entity) {
      // Retornar objeto com todos os campos como null
      return plainToInstance(AthleteBodyDataResponseDto, baseData, {
        excludeExtraneousValues: false, // Incluir todos os campos mesmo que null
      });
    }

    // Mesclar dados da entidade com o base
    const data = {
      ...baseData,
      weight: entity.weight ?? null,
      height: entity.height ?? null,
      footSize: entity.footSize ?? null,
      predominantStance: entity.predominantStance ?? null,
      swimmingProficiency: entity.swimmingProficiency ?? null,
      surfingStart: entity.surfingStart ?? null,
      emergencyProficiency: entity.emergencyProficiency ?? null,
      emergencyContact: entity.emergencyContact ?? null,
      healthPlan: entity.healthPlan ?? null,
    };

    return plainToInstance(AthleteBodyDataResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

