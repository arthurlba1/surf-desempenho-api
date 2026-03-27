import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { SubmitSelfEvaluationCommand } from './submit-self-evaluation.command';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole } from '@/school/schemas/membership.schema';

@Injectable()
export class SubmitSelfEvaluationUseCase extends BaseUseCase<
  SubmitSelfEvaluationCommand & { sessionId: string },
  TrainingSessionEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    payload: SubmitSelfEvaluationCommand & { sessionId: string },
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity>> {
    const { sessionId, ...fields } = payload;

    const session = await this.trainingSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Training session not found');
    }

    if (!auth.currentActiveSchoolId || session.schoolId !== auth.currentActiveSchoolId) {
      throw new ForbiddenException('Training session does not belong to your active school');
    }

    const userMembership = await this.membershipRepository.findByUserIdAndSchoolId(
      auth.id,
      auth.currentActiveSchoolId,
    );

    if (!userMembership || userMembership.role !== MembershipRole.SURFER) {
      throw new ForbiddenException('Only surfers can submit self evaluations');
    }

    if (!session.participants.includes(auth.id)) {
      throw new ForbiddenException('You can only self-evaluate sessions you participated in');
    }

    const updated = await this.trainingSessionRepository.upsertSelfEvaluation(sessionId, {
      athleteId: auth.id,
      physicalEffortIntensity: fields.physicalEffortIntensity,
      positiveAffect: fields.positiveAffect,
      negativeAffect: fields.negativeAffect,
      submittedAt: new Date(),
    });

    return this.ok('Self evaluation submitted successfully', updated!);
  }
}
