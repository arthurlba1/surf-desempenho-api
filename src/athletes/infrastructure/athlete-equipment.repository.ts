import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AthleteEquipment, AthleteEquipmentDocument } from '@/athletes/schemas/athlete-equipment.schema';
import { IAthleteEquipmentRepository } from '@/athletes/repositories/athlete-equipment.repository.interface';

@Injectable()
export class AthleteEquipmentRepository implements IAthleteEquipmentRepository {
  constructor(
    @InjectModel(AthleteEquipment.name) private equipmentModel: Model<AthleteEquipmentDocument>
  ) {}

  async findByAthleteId(athleteId: string): Promise<AthleteEquipmentDocument[]> {
    return await this.equipmentModel.find({ athleteId }).sort({ date: -1 }).exec();
  }

  async create(data: Partial<AthleteEquipmentDocument>): Promise<AthleteEquipmentDocument> {
    const equipment = new this.equipmentModel(data);
    return await equipment.save();
  }
}

