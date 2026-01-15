import type { CompetitiveRecord } from '@/athlete/schemas/competitive-record.schema';

export abstract class ICompetitiveRecordRepositoryPort {
  abstract listByAthleteId(athleteId: string): Promise<CompetitiveRecord[]>;
  abstract create(record: Partial<CompetitiveRecord>): Promise<CompetitiveRecord>;
  abstract updateByIdAndAthleteId(id: string, athleteId: string, patch: Partial<CompetitiveRecord>): Promise<CompetitiveRecord | null>;
  abstract deleteByIdAndAthleteId(id: string, athleteId: string): Promise<boolean>;
  abstract deleteManyByAthleteId(athleteId: string): Promise<number>;
}
