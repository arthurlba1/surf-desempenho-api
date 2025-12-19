import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AthleteCompetition, AthleteCompetitionDocument } from '@/athletes/schemas/athlete-competition.schema';
import { IAthleteCompetitionRepository } from '@/athletes/repositories/athlete-competition.repository.interface';

@Injectable()
export class AthleteCompetitionRepository implements IAthleteCompetitionRepository {
  constructor(
    @InjectModel(AthleteCompetition.name) private competitionModel: Model<AthleteCompetitionDocument>
  ) {}

  async findByAthleteId(athleteId: string): Promise<AthleteCompetitionDocument[]> {
    return await this.competitionModel.find({ athleteId }).sort({ date: -1 }).exec();
  }

  async create(data: Partial<AthleteCompetitionDocument>): Promise<AthleteCompetitionDocument> {
    const competition = new this.competitionModel(data);
    return await competition.save();
  }
}

