import { Expose, plainToInstance, Type } from "class-transformer";

import { Session } from "../schemas/session.schema";
import { SeaType } from "../types/sea";

class SeaConditionsResponseDto {
  @Expose()
  seaType?: SeaType;

  @Expose()
  seabed?: string;

  @Expose()
  swellConsistency?: string;

  @Expose()
  windInterference?: string;

  @Expose()
  crowdSituation?: string;

  @Expose()
  waterTemperature?: string;

  @Expose()
  nps?: number;
}

class WaveConditionsResponseDto {
  @Expose()
  speed?: string;

  @Expose()
  waveShape?: string;

  @Expose()
  riskLevel?: string;

  @Expose()
  waveExtension?: string;

  @Expose()
  maneuveringOpportunities?: string;

  @Expose()
  dropCondition?: string;

  @Expose()
  nps?: number;
}

class SessionAthleteResponseDto {
  @Expose()
  userId: string;

  @Expose()
  name: string;

  @Expose()
  profilePictureUrl?: string;
}

class SessionLocationResponseDto {
  @Expose()
  name: string;

  @Expose()
  lat?: number;

  @Expose()
  log?: number;
}

export class SessionResponseDto {
  @Expose()
  id: string;

  @Expose()
  schoolId: string;

  @Expose()
  duration: number;

  @Expose()
  totalDuration?: number;

  @Expose()
  inProgress: boolean;

  @Expose()
  @Type(() => SeaConditionsResponseDto)
  seaConditions?: SeaConditionsResponseDto;

  @Expose()
  @Type(() => WaveConditionsResponseDto)
  waveConditions?: WaveConditionsResponseDto;

  @Expose()
  @Type(() => SessionAthleteResponseDto)
  coach: SessionAthleteResponseDto;

  @Expose()
  @Type(() => SessionAthleteResponseDto)
  athletes?: SessionAthleteResponseDto[];

  @Expose()
  @Type(() => SessionLocationResponseDto)
  location?: SessionLocationResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Session & { _id?: any; id?: string }): SessionResponseDto {
    const plain = typeof (entity as any)?.toObject === 'function' 
      ? (entity as any).toObject() 
      : entity;
    
    // Garantir que o id seja uma string (convertendo _id se necessário)
    const entityWithId = {
      ...plain,
      id: plain.id || plain._id?.toString() || plain._id,
    };

    return plainToInstance(SessionResponseDto, entityWithId, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: (Session & { _id?: any; id?: string })[]): SessionResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}

