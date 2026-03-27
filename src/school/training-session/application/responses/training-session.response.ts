import {
  TrainingSessionStatus,
  Location,
  SeaConditions,
  WaveConditions,
  AudioMessage,
} from '@/school/training-session/schemas/training-session.schema';
import { SetupEvaluationEntity } from '@/school/training-session/domain/entities/setup-evaluation.entity';

export class SetupEvaluationResponse {
  id: string;
  trainingSessionId: string;
  schoolId: string;
  athleteId: string;
  setupId: string;
  source?: string;
  cruisingSpeed?: string;
  attackSpeed?: string;
  submergedSpeed?: string;
  overallBoardFlow?: string;
  perceivedSpeed?: string;
  maneuverability?: string;
  control?: string;
  nps?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AthleteEvaluationResponse {
  id: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class TrainingSessionResponse {
  id: string;
  schoolId: string;
  createdBy: string;
  status: TrainingSessionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  totalDuration?: number;
  participants: string[];
  location?: Location;
  seaConditions?: SeaConditions;
  waveConditions?: WaveConditions;
  audioMessages: AudioMessage[];
  evaluatedParticipantsCount?: number;
  evaluations?: AthleteEvaluationResponse[];
  setupEvaluations?: SetupEvaluationResponse[];
  hasPendingEvaluations?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EvaluationEntityLike = {
  id: string;
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
  createdAt?: Date;
  updatedAt?: Date;
};

export function toEvaluationResponse(e: EvaluationEntityLike): AthleteEvaluationResponse {
  return {
    id: e.id,
    trainingSessionId: e.trainingSessionId,
    schoolId: e.schoolId,
    athleteId: e.athleteId,
    perceivedFluidity: e.perceivedFluidity,
    perceivedSpeed: e.perceivedSpeed,
    power: e.power,
    varietyOfManeuvers: e.varietyOfManeuvers,
    combinationOfManeuvers: e.combinationOfManeuvers,
    completionRate: e.completionRate,
    commitment: e.commitment,
    overallTrainingVolume: e.overallTrainingVolume,
    adherenceToProposal: e.adherenceToProposal,
    motivation: e.motivation,
    nps: e.nps,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export function toSetupEvaluationResponse(e: SetupEvaluationEntity): SetupEvaluationResponse {
  return {
    id: e.id,
    trainingSessionId: e.trainingSessionId,
    schoolId: e.schoolId,
    athleteId: e.athleteId,
    setupId: e.setupId,
    source: e.source,
    cruisingSpeed: e.cruisingSpeed,
    attackSpeed: e.attackSpeed,
    submergedSpeed: e.submergedSpeed,
    overallBoardFlow: e.overallBoardFlow,
    perceivedSpeed: e.perceivedSpeed,
    maneuverability: e.maneuverability,
    control: e.control,
    nps: e.nps,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export function toSessionWithEvaluationsResponse(
  session: Record<string, any>,
  evaluationResponses: AthleteEvaluationResponse[],
  setupEvaluationResponses?: SetupEvaluationResponse[],
): TrainingSessionResponse {
  const count = session.evaluatedParticipantsCount ?? 0;
  const participantCount = session.participants?.length ?? 0;
  return {
    ...session,
    evaluatedParticipantsCount: count,
    evaluations: evaluationResponses,
    setupEvaluations: setupEvaluationResponses,
    hasPendingEvaluations: count < participantCount,
  } as TrainingSessionResponse;
}
