import { AthleteBodyDataDocument } from '@/athletes/schemas/athlete-body-data.schema';

export abstract class IAthleteBodyDataRepository {
  abstract findByAthleteId(athleteId: string): Promise<AthleteBodyDataDocument | null>;
  abstract create(data: Partial<AthleteBodyDataDocument>): Promise<AthleteBodyDataDocument>;
  abstract update(athleteId: string, data: Partial<AthleteBodyDataDocument>): Promise<AthleteBodyDataDocument | null>;
}

