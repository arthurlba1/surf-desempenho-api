import { UserEntity } from '@/identity/domain/entities/user.entity';
import { UserRole } from '@/common/types/user-role.types';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  birthdate?: string;
  document?: string;
  currentActiveSchoolId?: string;
  sync?: {
    status: string;
    version: number;
    updatedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;

  static fromEntity(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      profilePictureUrl: entity.profilePictureUrl,
      birthdate: entity.birthdate,
      document: entity.document,
      currentActiveSchoolId: entity.currentActiveSchoolId,
      sync: entity.sync,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
