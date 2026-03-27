import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SetupEvaluation,
  SetupEvaluationDocument,
} from '@/school/training-session/schemas/setup-evaluation.schema';
import { SetupEvaluationEntity } from '@/school/training-session/domain/entities/setup-evaluation.entity';
import {
  ISetupEvaluationRepositoryPort,
  UpsertSetupEvaluationData,
} from '@/school/training-session/domain/ports/setup-evaluation.repository.port';

@Injectable()
export class SetupEvaluationRepository implements ISetupEvaluationRepositoryPort {
  constructor(
    @InjectModel(SetupEvaluation.name)
    private evaluationModel: Model<SetupEvaluationDocument>,
  ) {}

  async upsert(data: UpsertSetupEvaluationData): Promise<{ evaluation: SetupEvaluationEntity; isNew: boolean }> {
    const source = data.source ?? 'coach';
    const filter = { trainingSessionId: data.trainingSessionId, setupId: data.setupId, source };
    const existing = await this.evaluationModel.findOne(filter).exec();

    const updatePayload = {
      schoolId: data.schoolId,
      athleteId: data.athleteId,
      source,
      cruisingSpeed: data.cruisingSpeed,
      attackSpeed: data.attackSpeed,
      submergedSpeed: data.submergedSpeed,
      overallBoardFlow: data.overallBoardFlow,
      perceivedSpeed: data.perceivedSpeed,
      maneuverability: data.maneuverability,
      control: data.control,
      nps: data.nps,
    };

    const updated = await this.evaluationModel
      .findOneAndUpdate(
        filter,
        { $set: updatePayload },
        { upsert: true, new: true },
      )
      .exec();

    if (!updated) {
      throw new Error('Failed to upsert setup evaluation');
    }

    return {
      evaluation: SetupEvaluationEntity.fromDocument(updated),
      isNew: !existing,
    };
  }

  async findBySessionId(sessionId: string): Promise<SetupEvaluationEntity[]> {
    const docs = await this.evaluationModel.find({ trainingSessionId: sessionId }).exec();
    return docs.map((d) => SetupEvaluationEntity.fromDocument(d));
  }

  async findByAthleteId(athleteId: string): Promise<SetupEvaluationEntity[]> {
    const docs = await this.evaluationModel.find({ athleteId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => SetupEvaluationEntity.fromDocument(d));
  }
}
