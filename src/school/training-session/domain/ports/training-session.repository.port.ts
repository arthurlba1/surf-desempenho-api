import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import type { SelfEvaluation } from '@/school/training-session/schemas/training-session.schema';

export abstract class ITrainingSessionRepositoryPort {
  abstract create(session: TrainingSessionEntity): Promise<TrainingSessionEntity>;
  abstract findById(id: string): Promise<TrainingSessionEntity | null>;
  abstract findBySchoolId(schoolId: string): Promise<TrainingSessionEntity[]>;
  abstract findBySchoolIdAndStatus(schoolId: string, status: string): Promise<TrainingSessionEntity[]>;
  abstract findByParticipant(userId: string): Promise<TrainingSessionEntity[]>;
  abstract update(id: string, session: TrainingSessionEntity, expectedVersion?: number): Promise<TrainingSessionEntity | null>;
  abstract incrementEvaluatedCount(sessionId: string): Promise<void>;
  abstract upsertSelfEvaluation(sessionId: string, evaluation: SelfEvaluation): Promise<TrainingSessionEntity | null>;
  abstract remove(id: string): Promise<void>;
}
