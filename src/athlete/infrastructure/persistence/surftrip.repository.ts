import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { Surftrip, type SurftripDocument } from '@/athlete/schemas/surftrip.schema';
import { ISurftripRepositoryPort } from '@/athlete/domain/ports/surftrip.repository.port';

@Injectable()
export class SurftripRepository implements ISurftripRepositoryPort {
  constructor(
    @InjectModel(Surftrip.name)
    private readonly surftripModel: Model<SurftripDocument>,
  ) {}

  async listByAthleteId(athleteId: string): Promise<Surftrip[]> {
    return await this.surftripModel.find({ athleteId }).lean().exec();
  }

  async create(trip: Partial<Surftrip>): Promise<Surftrip> {
    const { _id, ...tripWithoutId } = trip as any;
    const created = await this.surftripModel.create(tripWithoutId);
    return created.toObject();
  }

  async updateByIdAndAthleteId(
    id: string,
    athleteId: string,
    patch: Partial<Surftrip>,
  ): Promise<Surftrip | null> {
    return await this.surftripModel.findOneAndUpdate(
      { _id: id, athleteId },
      { $set: patch },
      { new: true },
    ).lean().exec();
  }

  async deleteByIdAndAthleteId(id: string, athleteId: string): Promise<boolean> {
    const result = await this.surftripModel.deleteOne({ _id: id, athleteId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }

  async deleteManyByAthleteId(athleteId: string): Promise<number> {
    const result = await this.surftripModel.deleteMany({ athleteId }).exec();
    return result.deletedCount ?? 0;
  }
}
