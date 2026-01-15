import { SchoolEntity } from '@/school/domain/entities/school.entity';

export class SchoolResponseDto {
  id: string;
  name: string;
  ownerId: string;
  sync?: {
    status: string;
    version: number;
    updatedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;

  static fromEntity(entity: SchoolEntity): SchoolResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      ownerId: entity.ownerId,
      sync: entity.sync,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
