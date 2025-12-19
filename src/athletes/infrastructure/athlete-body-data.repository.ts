import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AthleteBodyData, AthleteBodyDataDocument } from '@/athletes/schemas/athlete-body-data.schema';
import { IAthleteBodyDataRepository } from '@/athletes/repositories/athlete-body-data.repository.interface';

@Injectable()
export class AthleteBodyDataRepository implements IAthleteBodyDataRepository {
  constructor(
    @InjectModel(AthleteBodyData.name) private bodyDataModel: Model<AthleteBodyDataDocument>
  ) {}

  async findByAthleteId(athleteId: string): Promise<AthleteBodyDataDocument | null> {
    return await this.bodyDataModel.findOne({ athleteId }).exec();
  }

  async create(data: Partial<AthleteBodyDataDocument>): Promise<AthleteBodyDataDocument> {
    const bodyData = new this.bodyDataModel(data);
    return await bodyData.save();
  }

  async update(athleteId: string, data: Partial<AthleteBodyDataDocument>): Promise<AthleteBodyDataDocument | null> {
    return await this.bodyDataModel.findOneAndUpdate(
      { athleteId },
      data,
      { new: true, upsert: true }
    ).exec();
  }
}

