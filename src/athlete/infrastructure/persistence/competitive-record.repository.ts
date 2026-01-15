import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { CompetitiveRecord, type CompetitiveRecordDocument } from '@/athlete/schemas/competitive-record.schema';
import { ICompetitiveRecordRepositoryPort } from '@/athlete/domain/ports/competitive-record.repository.port';

@Injectable()
export class CompetitiveRecordRepository implements ICompetitiveRecordRepositoryPort {
  constructor(
    @InjectModel(CompetitiveRecord.name)
    private readonly competitiveRecordModel: Model<CompetitiveRecordDocument>,
  ) {}

  async listByAthleteId(athleteId: string): Promise<CompetitiveRecord[]> {
    return await this.competitiveRecordModel.find({ athleteId }).lean().exec();
  }

  async create(record: Partial<CompetitiveRecord>): Promise<CompetitiveRecord> {
    const { _id, ...recordWithoutId } = record as any;
    const created = await this.competitiveRecordModel.create(recordWithoutId);
    return created.toObject();
  }

  async updateByIdAndAthleteId(
    id: string,
    athleteId: string,
    patch: Partial<CompetitiveRecord>,
  ): Promise<CompetitiveRecord | null> {
    return await this.competitiveRecordModel.findOneAndUpdate(
      { _id: id, athleteId },
      { $set: patch },
      { new: true },
    ).lean().exec();
  }

  async deleteByIdAndAthleteId(id: string, athleteId: string): Promise<boolean> {
    const result = await this.competitiveRecordModel.deleteOne({ _id: id, athleteId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }

  async deleteManyByAthleteId(athleteId: string): Promise<number> {
    const result = await this.competitiveRecordModel.deleteMany({ athleteId }).exec();
    return result.deletedCount ?? 0;
  }
}
