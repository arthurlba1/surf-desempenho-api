import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { Surfboard, type SurfboardDocument } from '@/athlete/schemas/surfboard.schema';
import { ISurfboardRepositoryPort } from '@/athlete/domain/ports/surfboard.repository.port';

@Injectable()
export class SurfboardRepository implements ISurfboardRepositoryPort {
  constructor(
    @InjectModel(Surfboard.name)
    private readonly surfboardModel: Model<SurfboardDocument>,
  ) {}

  async listByOwnerId(ownerId: string): Promise<Surfboard[]> {
    return await this.surfboardModel.find({ ownerId }).lean().exec();
  }

  async create(board: Partial<Surfboard>): Promise<Surfboard> {
    const { _id, ...boardWithoutId } = board as any;
    const created = await this.surfboardModel.create(boardWithoutId);
    return created.toObject();
  }

  async updateByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: Partial<Surfboard>,
  ): Promise<Surfboard | null> {
    return await this.surfboardModel.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: patch },
      { new: true },
    ).lean().exec();
  }

  async deleteByIdAndOwnerId(id: string, ownerId: string): Promise<boolean> {
    const result = await this.surfboardModel.deleteOne({ _id: id, ownerId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }
}
