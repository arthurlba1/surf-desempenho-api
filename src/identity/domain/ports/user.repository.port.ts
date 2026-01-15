import { UserEntity } from '@/identity/domain/entities/user.entity';

export abstract class IUserRepositoryPort {
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findManyByIds(ids: string[]): Promise<UserEntity[]>;
  abstract update(id: string, user: UserEntity, expectedVersion?: number): Promise<UserEntity | null>;
  abstract remove(id: string): Promise<void>;
  abstract setCurrentActiveSchoolId(userId: string, schoolId: string): Promise<UserEntity | null>;
  abstract findByVersion(id: string, version: number): Promise<UserEntity | null>;
}
