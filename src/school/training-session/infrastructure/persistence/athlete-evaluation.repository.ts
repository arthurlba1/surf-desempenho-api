import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AthleteEvaluation,
  AthleteEvaluationDocument,
} from '@/school/training-session/schemas/athlete-evaluation.schema';
import { AthleteEvaluationEntity } from '@/school/training-session/domain/entities/athlete-evaluation.entity';
import {
  IAthleteEvaluationRepositoryPort,
  UpsertEvaluationData,
} from '@/school/training-session/domain/ports/athlete-evaluation.repository.port';

@Injectable()
export class AthleteEvaluationRepository implements IAthleteEvaluationRepositoryPort {
  constructor(
    @InjectModel(AthleteEvaluation.name)
    private evaluationModel: Model<AthleteEvaluationDocument>,
  ) {}

  async upsert(data: UpsertEvaluationData): Promise<{ evaluation: AthleteEvaluationEntity; isNew: boolean }> {
    const existing = await this.evaluationModel
      .findOne({ trainingSessionId: data.trainingSessionId, athleteId: data.athleteId })
      .exec();

    const updatePayload = {
      schoolId: data.schoolId,
      perceivedFluidity: data.perceivedFluidity,
      perceivedSpeed: data.perceivedSpeed,
      power: data.power,
      varietyOfManeuvers: data.varietyOfManeuvers,
      combinationOfManeuvers: data.combinationOfManeuvers,
      completionRate: data.completionRate,
      commitment: data.commitment,
      overallTrainingVolume: data.overallTrainingVolume,
      adherenceToProposal: data.adherenceToProposal,
      motivation: data.motivation,
      nps: data.nps,
    };

    const updated = await this.evaluationModel
      .findOneAndUpdate(
        { trainingSessionId: data.trainingSessionId, athleteId: data.athleteId },
        { $set: updatePayload },
        { upsert: true, new: true },
      )
      .exec();

    if (!updated) {
      throw new Error('Failed to upsert athlete evaluation');
    }

    return {
      evaluation: AthleteEvaluationEntity.fromDocument(updated),
      isNew: !existing,
    };
  }

  async findBySessionId(sessionId: string): Promise<AthleteEvaluationEntity[]> {
    const docs = await this.evaluationModel.find({ trainingSessionId: sessionId }).exec();
    return docs.map((d) => AthleteEvaluationEntity.fromDocument(d));
  }

  async findByAthleteId(athleteId: string): Promise<AthleteEvaluationEntity[]> {
    const docs = await this.evaluationModel.find({ athleteId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => AthleteEvaluationEntity.fromDocument(d));
  }
}
