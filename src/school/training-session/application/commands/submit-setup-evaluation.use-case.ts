import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { SubmitSetupEvaluationCommand } from './submit-setup-evaluation.command';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { ISetupEvaluationRepositoryPort } from '@/school/training-session/domain/ports/setup-evaluation.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { isCoachRole } from '@/school/schemas/membership.schema';

@Injectable()
export class SubmitSetupEvaluationUseCase extends BaseUseCase<
  SubmitSetupEvaluationCommand & { sessionId: string },
  TrainingSessionEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly setupEvaluationRepository: ISetupEvaluationRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    payload: SubmitSetupEvaluationCommand & { sessionId: string },
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity>> {
    const { sessionId, athleteId, setupId, ...fields } = payload;

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
    if (!userMembership || !isCoachRole(userMembership.role)) {
      throw new ForbiddenException('Only coaches can submit setup evaluations');
    }

    if (!session.participants.includes(athleteId)) {
      throw new BadRequestException('Athlete is not a participant of this session');
    }

    await this.setupEvaluationRepository.upsert({
      trainingSessionId: sessionId,
      schoolId: session.schoolId,
      athleteId,
      setupId,
      ...fields,
    });

    const updatedSession = await this.trainingSessionRepository.findById(sessionId);
    return this.ok('Setup evaluation saved successfully', updatedSession!);
  }
}
