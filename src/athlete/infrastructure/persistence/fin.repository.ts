import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { Fin, type FinDocument } from '@/athlete/schemas/fin.schema';
import { IFinRepositoryPort } from '@/athlete/domain/ports/fin.repository.port';

@Injectable()
export class FinRepository implements IFinRepositoryPort {
  constructor(
    @InjectModel(Fin.name)
    private readonly finModel: Model<FinDocument>,
  ) {}

  async listByOwnerId(ownerId: string): Promise<Fin[]> {
    return await this.finModel.find({ ownerId }).lean().exec();
  }

  async create(fin: Partial<Fin>): Promise<Fin> {
    const { _id, ...finWithoutId } = fin as any;
    const created = await this.finModel.create(finWithoutId);
    return created.toObject();
  }

  async updateByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: Partial<Fin>,
  ): Promise<Fin | null> {
    return await this.finModel.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: patch },
      { new: true },
    ).lean().exec();
  }

  async deleteByIdAndOwnerId(id: string, ownerId: string): Promise<boolean> {
    const result = await this.finModel.deleteOne({ _id: id, ownerId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }
}
