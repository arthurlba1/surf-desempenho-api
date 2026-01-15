import { MembershipEntity } from '@/school/domain/entities/membership.entity';

export abstract class IMembershipRepositoryPort {
  abstract create(membership: MembershipEntity): Promise<MembershipEntity>;
  abstract findById(id: string): Promise<MembershipEntity | null>;
  abstract findByUserIdAndSchoolId(userId: string, schoolId: string): Promise<MembershipEntity | null>;
  abstract findByUserId(userId: string): Promise<MembershipEntity[]>;
  abstract findBySchoolId(schoolId: string): Promise<MembershipEntity[]>;
  abstract update(id: string, membership: MembershipEntity, expectedVersion?: number): Promise<MembershipEntity | null>;
  abstract remove(id: string): Promise<void>;
}
