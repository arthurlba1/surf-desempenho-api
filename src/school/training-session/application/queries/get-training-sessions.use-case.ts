import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { GetTrainingSessionsQuery } from './get-training-sessions.query';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { isCoachRole } from '@/school/schemas/membership.schema';

@Injectable()
export class GetTrainingSessionsUseCase extends BaseUseCase<
  GetTrainingSessionsQuery,
  TrainingSessionEntity[]
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    query: GetTrainingSessionsQuery,
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity[]>> {
    if (!auth.currentActiveSchoolId) {
      return this.ok('No active school', []);
    }

    const userMembership = await this.membershipRepository.findByUserIdAndSchoolId(
      auth.id,
      auth.currentActiveSchoolId,
    );

    if (!userMembership) {
      return this.ok('User is not a member of the school', []);
    }

    let sessions: TrainingSessionEntity[];

    if (isCoachRole(userMembership.role)) {
      if (query.status) {
        sessions = await this.trainingSessionRepository.findBySchoolIdAndStatus(
          auth.currentActiveSchoolId,
          query.status,
        );
      } else {
        sessions = await this.trainingSessionRepository.findBySchoolId(auth.currentActiveSchoolId);
      }
    } else {
      sessions = await this.trainingSessionRepository.findByParticipant(auth.id);
  
      if (query.status) {
        sessions = sessions.filter((s) => s.status === query.status);
      }
    }

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      sessions = sessions.filter((s) => {
        if (!s.startTime) return false;
        return s.startTime >= startDate;
      });
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      sessions = sessions.filter((s) => {
        if (!s.startTime) return false;
        return s.startTime <= endDate;
      });
    }

    return this.ok('Training sessions retrieved successfully', sessions);
  }
}
