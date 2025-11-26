 import { Expose, Type, plainToInstance } from 'class-transformer';

import { Session } from '@/session/schemas/session.schema';

class SessionSummaryCoachDto {
  @Expose()
  userId: string;

  @Expose()
  name: string;

  @Expose()
  profilePictureUrl?: string;
}

class SessionSummaryLocationDto {
  @Expose()
  name: string;

  @Expose()
  lat?: number;

  @Expose()
  log?: number;
}

export class SessionSummaryDto {
  @Expose()
  id: string;

  @Expose()
  inProgress: boolean;

  @Expose()
  duration: number;

  @Expose()
  totalDuration?: number;

  @Expose()
  @Type(() => SessionSummaryCoachDto)
  coach: SessionSummaryCoachDto;

  @Expose()
  @Type(() => SessionSummaryLocationDto)
  location?: SessionSummaryLocationDto;

  @Expose()
  createdAt: Date;

  static fromEntity(entity: Session & { _id?: any; id?: string }): SessionSummaryDto {
    const plain = typeof (entity as any)?.toObject === 'function'
      ? (entity as any).toObject()
      : entity;

    const entityWithId = {
      ...plain,
      id: plain.id || plain._id?.toString() || plain._id,
    };

    return plainToInstance(SessionSummaryDto, entityWithId, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: (Session & { _id?: any; id?: string })[]): SessionSummaryDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}


