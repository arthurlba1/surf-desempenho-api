import type { AthleteProfile } from '@/athlete/schemas/athlete-profile.schema';

export abstract class IAthleteProfileRepositoryPort {
  abstract findByUserId(userId: string): Promise<AthleteProfile | null>;
  abstract create(profile: AthleteProfile): Promise<AthleteProfile>;
  abstract updateUpsertByUserId(userId: string, patch: Partial<AthleteProfile>): Promise<AthleteProfile>;
  abstract deleteByUserId(userId: string): Promise<boolean>;
}
