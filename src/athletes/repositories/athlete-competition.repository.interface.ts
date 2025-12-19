import { AthleteCompetitionDocument } from '@/athletes/schemas/athlete-competition.schema';

export abstract class IAthleteCompetitionRepository {
  abstract findByAthleteId(athleteId: string): Promise<AthleteCompetitionDocument[]>;
  abstract create(data: Partial<AthleteCompetitionDocument>): Promise<AthleteCompetitionDocument>;
}

