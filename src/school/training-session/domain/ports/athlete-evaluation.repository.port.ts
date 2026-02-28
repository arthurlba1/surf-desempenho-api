import { AthleteEvaluationEntity } from '@/school/training-session/domain/entities/athlete-evaluation.entity';

export interface UpsertEvaluationData {
  trainingSessionId: string;
  schoolId: string;
  athleteId: string;
  perceivedFluidity?: string;
  perceivedSpeed?: string;
  power?: string;
  varietyOfManeuvers?: string;
  combinationOfManeuvers?: string;
  completionRate?: number;
  commitment?: string;
  overallTrainingVolume?: string;
  adherenceToProposal?: string;
  motivation?: string;
  nps?: number;
}

export abstract class IAthleteEvaluationRepositoryPort {
  abstract upsert(data: UpsertEvaluationData): Promise<{ evaluation: AthleteEvaluationEntity; isNew: boolean }>;
  abstract findBySessionId(sessionId: string): Promise<AthleteEvaluationEntity[]>;
  abstract findByAthleteId(athleteId: string): Promise<AthleteEvaluationEntity[]>;
}
