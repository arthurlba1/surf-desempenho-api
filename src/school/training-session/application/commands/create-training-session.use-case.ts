import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { CreateTrainingSessionCommand } from './create-training-session.command';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { TrainingSessionStatus } from '@/school/training-session/schemas/training-session.schema';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipStatus, MembershipRole, isCoachRole } from '@/school/schemas/membership.schema';

@Injectable()
export class CreateTrainingSessionUseCase extends BaseUseCase<
  CreateTrainingSessionCommand,
  TrainingSessionEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    payload: CreateTrainingSessionCommand,
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity>> {
    if (!auth.currentActiveSchoolId) {
      throw new BadRequestException('User must have an active school to create a training session');
    }

    const creatorMembership = await this.membershipRepository.findByUserIdAndSchoolId(
      auth.id,
      auth.currentActiveSchoolId,
    );

    if (!creatorMembership) {
      throw new NotFoundException('Creator is not a member of the school');
    }

    if (!isCoachRole(creatorMembership.role)) {
      throw new ForbiddenException('Only coaches and headcoaches can create training sessions');
    }

    if (creatorMembership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException('Creator must have an active membership');
    }

    for (const participantId of payload.participants) {
      const participantMembership = await this.membershipRepository.findByUserIdAndSchoolId(
        participantId,
        auth.currentActiveSchoolId,
      );

      if (!participantMembership) {
        throw new NotFoundException(`Participant ${participantId} is not a member of the school`);
      }

      if (participantMembership.role !== MembershipRole.SURFER) {
        throw new BadRequestException(`Participant ${participantId} must be a surfer`);
      }

      if (participantMembership.status !== MembershipStatus.ACTIVE) {
        throw new BadRequestException(`Participant ${participantId} must have an active membership`);
      }
    }

    if (payload.location && !payload.location.name) {
      throw new BadRequestException('Location name is required when location is provided');
    }

    const status = payload.status || TrainingSessionStatus.SCHEDULED;
    if (status === TrainingSessionStatus.IN_PROGRESS && !payload.startTime) {
      throw new BadRequestException('startTime is required when status is in-progress');
    }

    const sessionEntity = TrainingSessionEntity.create({
      id: payload.id,
      schoolId: auth.currentActiveSchoolId,
      createdBy: auth.id,
      status: status as TrainingSessionStatus,
      startTime: payload.startTime || (status === TrainingSessionStatus.IN_PROGRESS ? new Date() : undefined),
      duration: payload.duration,
      participants: payload.participants,
      location: payload.location,
    });

    const created = await this.trainingSessionRepository.create(sessionEntity);

    return this.ok('Training session created successfully', created);
  }
}
