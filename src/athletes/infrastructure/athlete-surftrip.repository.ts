import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AthleteSurftrip, AthleteSurftripDocument } from '@/athletes/schemas/athlete-surftrip.schema';
import { IAthleteSurftripRepository } from '@/athletes/repositories/athlete-surftrip.repository.interface';

@Injectable()
export class AthleteSurftripRepository implements IAthleteSurftripRepository {
  constructor(
    @InjectModel(AthleteSurftrip.name) private surftripModel: Model<AthleteSurftripDocument>
  ) {}

  async findByAthleteId(athleteId: string): Promise<AthleteSurftripDocument[]> {
    return await this.surftripModel.find({ athleteId }).sort({ dateStart: -1 }).exec();
  }

  async create(data: Partial<AthleteSurftripDocument>): Promise<AthleteSurftripDocument> {
    const surftrip = new this.surftripModel(data);
    return await surftrip.save();
  }
}

