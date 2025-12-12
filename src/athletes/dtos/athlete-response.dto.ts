import { Expose, plainToInstance } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { UserDocument } from '@/users/schemas/user.schema';

export class AthleteResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  status?: string;

  @Expose()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @Expose()
  @IsString()
  @IsOptional()
  lastSessionDate?: string;

  static fromEntity(entity: UserDocument): AthleteResponseDto {
    return plainToInstance(AthleteResponseDto, {
      id: (entity._id as any).toString(),
      name: entity.name,
      status: 'Cliente ativo', // TODO: Calcular status baseado em dados reais
      avatarUrl: entity.profilePictureUrl,
      lastSessionDate: undefined, // TODO: Buscar da última sessão e converter para string
    }, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: UserDocument[]): AthleteResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}

