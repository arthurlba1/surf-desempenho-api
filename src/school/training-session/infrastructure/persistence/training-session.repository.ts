import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  TrainingSession,
  TrainingSessionDocument,
} from '@/school/training-session/schemas/training-session.schema';
import { TrainingSessionEntity } from '@/school/training-session/domain/entities/training-session.entity';
import { ITrainingSessionRepositoryPort } from '@/school/training-session/domain/ports/training-session.repository.port';

@Injectable()
export class TrainingSessionRepository implements ITrainingSessionRepositoryPort {
  constructor(
    @InjectModel(TrainingSession.name)
    private trainingSessionModel: Model<TrainingSessionDocument>,
  ) {}

  async create(session: TrainingSessionEntity): Promise<TrainingSessionEntity> {
    const sessionDoc = new this.trainingSessionModel(session.toDocument());
    const saved = await sessionDoc.save();
    const entity = TrainingSessionEntity.fromDocument(saved);

    entity.markAsSynced();
    await this.trainingSessionModel.findByIdAndUpdate(saved._id, { sync: entity.sync }).exec();

    return entity;
  }

  async findById(id: string): Promise<TrainingSessionEntity | null> {
    const session = await this.trainingSessionModel.findById(id).exec();
    if (!session) return null;
    return TrainingSessionEntity.fromDocument(session);
  }

  async findBySchoolId(schoolId: string): Promise<TrainingSessionEntity[]> {
    const sessions = await this.trainingSessionModel.find({ schoolId }).exec();
    return sessions.map((s) => TrainingSessionEntity.fromDocument(s));
  }

  async findBySchoolIdAndStatus(
    schoolId: string,
    status: string,
  ): Promise<TrainingSessionEntity[]> {
    const sessions = await this.trainingSessionModel.find({ schoolId, status }).exec();
    return sessions.map((s) => TrainingSessionEntity.fromDocument(s));
  }

  async findByParticipant(userId: string): Promise<TrainingSessionEntity[]> {
    const sessions = await this.trainingSessionModel.find({ participants: userId }).exec();
    return sessions.map((s) => TrainingSessionEntity.fromDocument(s));
  }

  async update(
    id: string,
    session: TrainingSessionEntity,
    expectedVersion?: number,
  ): Promise<TrainingSessionEntity | null> {
    if (expectedVersion !== undefined) {
      const existing = await this.trainingSessionModel.findById(id).exec();
      if (!existing) return null;

      const existingEntity = TrainingSessionEntity.fromDocument(existing);
      if (existingEntity.hasConflict(expectedVersion)) {
        existingEntity.markAsConflict();
        await this.trainingSessionModel.findByIdAndUpdate(id, { sync: existingEntity.sync }).exec();
        throw new ConflictException('Version conflict: document was modified by another operation');
      }
    }

    session.incrementVersion();
    session.markAsSynced();

    const updated = await this.trainingSessionModel.findByIdAndUpdate(
      id,
      { ...session.toDocument(), updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!updated) return null;
    return TrainingSessionEntity.fromDocument(updated);
  }

  async incrementEvaluatedCount(sessionId: string): Promise<void> {
    await this.trainingSessionModel
      .findByIdAndUpdate(sessionId, { $inc: { evaluatedParticipantsCount: 1 } })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.trainingSessionModel.findByIdAndDelete(id).exec();
  }
}
