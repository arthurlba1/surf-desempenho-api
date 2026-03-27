import type { AthleteEvaluationResponse, SetupEvaluationResponse } from '@/school/training-session/application/responses/training-session.response';
import {
  SurferTrainingSessionListItemDto,
  SurferTrainingSessionDetailDto,
  SurferAudioMessageDto,
} from '@/school/training-session/application/dtos/surfer-training-session.dto';
import type { SelfEvaluation } from '@/school/training-session/schemas/training-session.schema';

export function toSurferListItemDto(
  session: Record<string, any>,
  athleteId: string,
  evaluations: AthleteEvaluationResponse[],
  setupEvaluations: SetupEvaluationResponse[],
): SurferTrainingSessionListItemDto {
  const selfEvaluations: SelfEvaluation[] = session.selfEvaluations ?? [];
  const myEval = evaluations.find((e) => e.athleteId === athleteId);
  const mySetupEvals = setupEvaluations.filter((e) => e.athleteId === athleteId);
  const mySelfEval = selfEvaluations.find((e) => e.athleteId === athleteId);

  return {
    id: session.id ?? session._id?.toString(),
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    totalDuration: session.totalDuration,
    location: session.location,
    participants: session.participants ?? [],
    hasSelfEvaluation: !!mySelfEval,
    hasCoachEvaluation: !!myEval,
    hasCoachSetupEvaluation: mySetupEvals.length > 0,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function toSurferDetailDto(
  session: Record<string, any>,
  athleteId: string,
  evaluations: AthleteEvaluationResponse[],
  setupEvaluations: SetupEvaluationResponse[],
): SurferTrainingSessionDetailDto {
  const allAudioMessages: SurferAudioMessageDto[] = (session.audioMessages ?? [])
    .filter((m: any) => !m.recipientId || m.recipientId === athleteId)
    .map((m: any) => ({
      id: m.id,
      recipientId: m.recipientId,
      audioUrl: m.audioUrl,
      sentAt: m.sentAt,
      duration: m.duration,
    }));

  const selfEvaluations: SelfEvaluation[] = session.selfEvaluations ?? [];
  const myCoachEvaluation = evaluations.find((e) => e.athleteId === athleteId);
  const myCoachSetupEvaluations = setupEvaluations.filter(
    (e) => e.athleteId === athleteId && (!e.source || e.source === 'coach'),
  );
  const mySelfSetupEvaluations = setupEvaluations.filter(
    (e) => e.athleteId === athleteId && e.source === 'self',
  );
  const mySelfEvaluation = selfEvaluations.find((e) => e.athleteId === athleteId);

  return {
    id: session.id ?? session._id?.toString(),
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    totalDuration: session.totalDuration,
    location: session.location,
    participants: session.participants ?? [],
    audioMessages: allAudioMessages,
    myCoachEvaluation,
    myCoachSetupEvaluations,
    mySelfSetupEvaluations,
    mySelfEvaluation,
    hasSelfEvaluation: !!mySelfEvaluation,
    hasCoachEvaluation: !!myCoachEvaluation,
    hasCoachSetupEvaluation: myCoachSetupEvaluations.length > 0,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
