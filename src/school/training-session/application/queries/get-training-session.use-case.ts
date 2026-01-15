import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { GetTrainingSessionQuery } from './get-training-session.query';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole } from '@/school/schemas/membership.schema';

@Injectable()
export class GetTrainingSessionUseCase extends BaseUseCase<
  GetTrainingSessionQuery,
  TrainingSessionEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    query: GetTrainingSessionQuery,
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity>> {
    const session = await this.trainingSessionRepository.findById(query.id);
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

    if (!userMembership) {
      throw new ForbiddenException('User is not a member of the school');
    }

    if (userMembership.role === MembershipRole.SURFER && !session.participants.includes(auth.id)) {
      throw new ForbiddenException('You can only view training sessions you participated in');
    }

    return this.ok('Training session retrieved successfully', session);
  }
}
