import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { BoardSetup, type BoardSetupDocument } from '@/athlete/schemas/board-setup.schema';
import { IBoardSetupRepositoryPort } from '@/athlete/domain/ports/board-setup.repository.port';

@Injectable()
export class BoardSetupRepository implements IBoardSetupRepositoryPort {
  constructor(
    @InjectModel(BoardSetup.name)
    private readonly boardSetupModel: Model<BoardSetupDocument>,
  ) {}

  async listByOwnerId(ownerId: string): Promise<BoardSetup[]> {
    return await this.boardSetupModel.find({ ownerId }).lean().exec();
  }

  async create(setup: Partial<BoardSetup>): Promise<BoardSetup> {
    const { _id, ...setupWithoutId } = setup as any;
    const created = await this.boardSetupModel.create(setupWithoutId);
    return created.toObject();
  }

  async updateByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: Partial<BoardSetup>,
  ): Promise<BoardSetup | null> {
    return await this.boardSetupModel.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: patch },
      { new: true },
    ).lean().exec();
  }

  async deleteByIdAndOwnerId(id: string, ownerId: string): Promise<boolean> {
    const result = await this.boardSetupModel.deleteOne({ _id: id, ownerId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }
}
