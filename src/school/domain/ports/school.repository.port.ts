import { SchoolEntity } from '@/school/domain/entities/school.entity';

export abstract class ISchoolRepositoryPort {
  abstract create(school: SchoolEntity): Promise<SchoolEntity>;
  abstract findById(id: string): Promise<SchoolEntity | null>;
  abstract findByInviteToken(inviteToken: string): Promise<SchoolEntity | null>;
  /** TEMPORARY: short join code (same membership as invite token). */
  abstract findByTempJoinCode(code: string): Promise<SchoolEntity | null>;
  /** TEMPORARY: assign a unique short code if the school has none yet. */
  abstract ensureTempJoinCodeIfMissing(schoolId: string): Promise<SchoolEntity | null>;
  abstract findManyByIds(ids: string[]): Promise<SchoolEntity[]>;
  abstract update(id: string, school: SchoolEntity, expectedVersion?: number): Promise<SchoolEntity | null>;
  abstract remove(id: string): Promise<void>;
}
