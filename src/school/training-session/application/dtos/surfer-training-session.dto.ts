import type { TrainingSessionStatus, Location, AudioMessage } from '@/school/training-session/schemas/training-session.schema';
import type { AthleteEvaluationResponse, SetupEvaluationResponse } from '@/school/training-session/application/responses/training-session.response';
import type { SelfEvaluation } from '@/school/training-session/schemas/training-session.schema';

export class SurferAudioMessageDto {
  id: string;
  recipientId?: string;
  audioUrl: string;
  sentAt: Date;
  duration?: number;
}

export class SurferTrainingSessionListItemDto {
  id: string;
  status: TrainingSessionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  totalDuration?: number;
  location?: Location;
  participants: string[];
  hasSelfEvaluation: boolean;
  hasCoachEvaluation: boolean;
  hasCoachSetupEvaluation: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SurferTrainingSessionDetailDto {
  id: string;
  status: TrainingSessionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  totalDuration?: number;
  location?: Location;
  participants: string[];
  audioMessages: SurferAudioMessageDto[];
  myCoachEvaluation?: AthleteEvaluationResponse;
  myCoachSetupEvaluations: SetupEvaluationResponse[];
  mySelfSetupEvaluations: SetupEvaluationResponse[];
  mySelfEvaluation?: SelfEvaluation;
  hasSelfEvaluation: boolean;
  hasCoachEvaluation: boolean;
  hasCoachSetupEvaluation: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
