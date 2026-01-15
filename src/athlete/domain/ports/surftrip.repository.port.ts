import type { Surftrip } from '@/athlete/schemas/surftrip.schema';

export abstract class ISurftripRepositoryPort {
  abstract listByAthleteId(athleteId: string): Promise<Surftrip[]>;
  abstract create(trip: Partial<Surftrip>): Promise<Surftrip>;
  abstract updateByIdAndAthleteId(id: string, athleteId: string, patch: Partial<Surftrip>): Promise<Surftrip | null>;
  abstract deleteByIdAndAthleteId(id: string, athleteId: string): Promise<boolean>;
  abstract deleteManyByAthleteId(athleteId: string): Promise<number>;
}
