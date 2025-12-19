import { AthleteSurftripDocument } from '@/athletes/schemas/athlete-surftrip.schema';

export abstract class IAthleteSurftripRepository {
  abstract findByAthleteId(athleteId: string): Promise<AthleteSurftripDocument[]>;
  abstract create(data: Partial<AthleteSurftripDocument>): Promise<AthleteSurftripDocument>;
}

