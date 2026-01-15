import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import type { AuthUser } from '@/common/types/auth.types';
import { SendAudioMessageCommand } from './send-audio-message.command';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { TrainingSessionStatus, AudioMessage } from '@/school/training-session/schemas/training-session.schema';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipRole, isCoachRole } from '@/school/schemas/membership.schema';

@Injectable()
export class SendAudioMessageUseCase extends BaseUseCase<
  SendAudioMessageCommand,
  TrainingSessionEntity
> {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepositoryPort,
    private readonly membershipRepository: IMembershipRepositoryPort,
  ) {
    super();
  }

  async handle(
    payload: SendAudioMessageCommand,
    auth: AuthUser,
  ): Promise<IUseCaseResponse<TrainingSessionEntity>> {
    if (!payload.sessionId) {
      throw new BadRequestException('Session ID is required');
    }
    const session = await this.trainingSessionRepository.findById(payload.sessionId);
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
      throw new NotFoundException('User is not a member of the school');
    }

    const isHeadCoach = userMembership.role === MembershipRole.HEADCOACH;
    const isCreator = session.createdBy === auth.id;

    if (!isHeadCoach && !isCreator) {
      throw new ForbiddenException('Only the creator or headcoach can send audio messages');
    }

    if (session.status !== TrainingSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Audio messages can only be sent when session is in-progress');
    }

    if (payload.recipientId && !session.participants.includes(payload.recipientId)) {
      throw new BadRequestException('Recipient must be a participant of the training session');
    }

    const audioMessage: AudioMessage = {
      id: randomUUID(),
      recipientId: payload.recipientId,
      audioUrl: payload.audioUrl,
      sentAt: new Date(),
      duration: payload.duration,
    };

    session.addAudioMessage(audioMessage);

    const updated = await this.trainingSessionRepository.update(payload.sessionId, session);

    return this.ok('Audio message sent successfully', updated!);
  }
}
