import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { SubmitSelfSetupEvaluationCommand } from './submit-self-setup-evaluation.command';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { ISetupEvaluationRepositoryPort } from '@/school/training-session/domain/ports/setup-evaluation.repository.port';
import { SetupEvaluationEntity } from '@/school/training-session/domain/entities/setup-evaluation.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole } from '@/school/schemas/membership.schema';

@Injectable()
export class SubmitSelfSetupEvaluationUseCase extends BaseUseCase<
  SubmitSelfSetupEvaluationCommand & { sessionId: string },
  SetupEvaluationEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly setupEvaluationRepository: ISetupEvaluationRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    payload: SubmitSelfSetupEvaluationCommand & { sessionId: string },
    auth: AuthUser,
  ): Promise<IUseCaseResponse<SetupEvaluationEntity>> {
    const { sessionId, setupId, ...fields } = payload;

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
      throw new ForbiddenException('Only surfers can submit self setup evaluations');
    }

    if (!session.participants.includes(auth.id)) {
      throw new ForbiddenException('You can only self-evaluate sessions you participated in');
    }

    const participantSetup = session.participants.includes(auth.id);
    if (!participantSetup) {
      throw new BadRequestException('You are not a participant of this session');
    }

    const { evaluation } = await this.setupEvaluationRepository.upsert({
      trainingSessionId: sessionId,
      schoolId: session.schoolId,
      athleteId: auth.id,
      setupId,
      source: 'self',
      ...fields,
    });

    return this.ok('Self setup evaluation saved successfully', evaluation);
  }
}
