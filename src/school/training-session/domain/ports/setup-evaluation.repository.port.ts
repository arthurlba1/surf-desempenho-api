import { SetupEvaluationEntity } from '@/school/training-session/domain/entities/setup-evaluation.entity';

export interface UpsertSetupEvaluationData {
  trainingSessionId: string;
  schoolId: string;
  athleteId: string;
  setupId: string;
  cruisingSpeed?: string;
  attackSpeed?: string;
  submergedSpeed?: string;
  overallBoardFlow?: string;
  perceivedSpeed?: string;
  maneuverability?: string;
  control?: string;
  nps?: number;
}

export abstract class ISetupEvaluationRepositoryPort {
  abstract upsert(data: UpsertSetupEvaluationData): Promise<{ evaluation: SetupEvaluationEntity; isNew: boolean }>;
  abstract findBySessionId(sessionId: string): Promise<SetupEvaluationEntity[]>;
  abstract findByAthleteId(athleteId: string): Promise<SetupEvaluationEntity[]>;
}
