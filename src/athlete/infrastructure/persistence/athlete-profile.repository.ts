import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { AthleteProfile, type AthleteProfileDocument } from '@/athlete/schemas/athlete-profile.schema';
import { IAthleteProfileRepositoryPort } from '@/athlete/domain/ports/athlete-profile.repository.port';

@Injectable()
export class AthleteProfileRepository implements IAthleteProfileRepositoryPort {
  constructor(
    @InjectModel(AthleteProfile.name)
    private readonly athleteProfileModel: Model<AthleteProfileDocument>,
  ) {}

  async findByUserId(userId: string): Promise<AthleteProfile | null> {
    return await this.athleteProfileModel.findOne({ userId }).lean().exec();
  }

  async create(profile: AthleteProfile): Promise<AthleteProfile> {
    const doc = new this.athleteProfileModel(profile as any);
    const saved = await doc.save();
    return saved.toObject();
  }

  async updateUpsertByUserId(userId: string, patch: Partial<AthleteProfile>): Promise<AthleteProfile> {
    const updated = await this.athleteProfileModel.findOneAndUpdate(
      { userId },
      { $set: patch, $setOnInsert: { userId } },
      { new: true, upsert: true },
    ).lean().exec();
    return updated as AthleteProfile;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.athleteProfileModel.deleteOne({ userId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }
}
