import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { UpdateTrainingSessionCommand } from './update-training-session.command';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { TrainingSessionStatus } from '@/school/training-session/schemas/training-session.schema';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipStatus, MembershipRole, isCoachRole } from '@/school/schemas/membership.schema';

@Injectable()
export class UpdateTrainingSessionUseCase extends BaseUseCase<
  UpdateTrainingSessionCommand,
  TrainingSessionEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    payload: UpdateTrainingSessionCommand,
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity>> {
    if (!payload.id) {
      throw new BadRequestException('Session ID is required');
    }
    const existingSession = await this.trainingSessionRepository.findById(payload.id);
    if (!existingSession) {
      throw new NotFoundException('Training session not found');
    }

    if (!auth.currentActiveSchoolId || existingSession.schoolId !== auth.currentActiveSchoolId) {
      throw new ForbiddenException('Training session does not belong to your active school');
    }

    const userMembership = await this.membershipRepository.findByUserIdAndSchoolId(
      auth.id,
      auth.currentActiveSchoolId,
    );

    if (!userMembership) {
      throw new NotFoundException('User is not a member of the school');
    }

    const isHeadCoach = userMembership.role === MembershipRole.HEADCOACH;
    const isCreator = existingSession.createdBy === auth.id;

    if (!isHeadCoach && !isCreator) {
      throw new ForbiddenException('Only the creator or headcoach can update the training session');
    }

    if (payload.participants !== undefined) {
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
    }

    if (payload.location && !payload.location.name) {
      throw new BadRequestException('Location name is required when location is provided');
    }

    if (payload.status) {
      const newStatus = payload.status as TrainingSessionStatus;

      if (newStatus === TrainingSessionStatus.IN_PROGRESS) {
        if (!payload.startTime && !existingSession.startTime) {
          throw new BadRequestException('startTime is required when status changes to in-progress');
        }
      }

      if (newStatus === TrainingSessionStatus.COMPLETED) {
        if (!payload.endTime && !existingSession.endTime) {
          throw new BadRequestException('endTime is required when status changes to completed');
        }
        if (payload.totalDuration === undefined && existingSession.totalDuration === undefined) {
          throw new BadRequestException('totalDuration is required when status changes to completed');
        }
      }
    }

    const updatedEntity = TrainingSessionEntity.create({
      id: existingSession.id,
      schoolId: existingSession.schoolId,
      createdBy: existingSession.createdBy,
      status: (payload.status as TrainingSessionStatus) || existingSession.status,
      startTime: payload.startTime || existingSession.startTime,
      endTime: payload.endTime || existingSession.endTime,
      duration: payload.duration !== undefined ? payload.duration : existingSession.duration,
      totalDuration: payload.totalDuration !== undefined ? payload.totalDuration : existingSession.totalDuration,
      participants: payload.participants !== undefined ? payload.participants : existingSession.participants,
      location: payload.location || existingSession.location,
      seaConditions: payload.seaConditions || existingSession.seaConditions,
      waveConditions: payload.waveConditions || existingSession.waveConditions,
      audioMessages: existingSession.audioMessages,
      sync: existingSession.sync,
      createdAt: existingSession.createdAt,
      updatedAt: new Date(),
    });

    const updated = await this.trainingSessionRepository.update(payload.id, updatedEntity);

    return this.ok('Training session updated successfully', updated!);
  }
}
