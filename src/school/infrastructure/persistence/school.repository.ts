import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';

import { School, SchoolDocument } from '@/school/schemas/school.schema';
import { SchoolEntity } from '@/school/domain/entities/school.entity';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';

@Injectable()
export class SchoolRepository implements ISchoolRepositoryPort {
  constructor(@InjectModel(School.name) private schoolModel: Model<SchoolDocument>) {}

  async create(school: SchoolEntity): Promise<SchoolEntity> {
    const schoolDoc = new this.schoolModel(school.toDocument());
    const saved = await schoolDoc.save();
    const entity = SchoolEntity.fromDocument(saved);

    entity.markAsSynced();
    await this.schoolModel.findByIdAndUpdate(saved._id, { sync: entity.sync }).exec();
    
    return entity;
  }

  async findById(id: string): Promise<SchoolEntity | null> {
    const school = await this.schoolModel.findById(id).exec();
    if (!school) return null;
    return SchoolEntity.fromDocument(school);
  }

  async findByInviteToken(inviteToken: string): Promise<SchoolEntity | null> {
    const school = await this.schoolModel.findOne({ inviteToken }).exec();
    if (!school) return null;
    return SchoolEntity.fromDocument(school);
  }

  async findByTempJoinCode(code: string): Promise<SchoolEntity | null> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;
    const school = await this.schoolModel.findOne({ tempJoinCode: normalized }).exec();
    if (!school) return null;
    return SchoolEntity.fromDocument(school);
  }

  async ensureTempJoinCodeIfMissing(schoolId: string): Promise<SchoolEntity | null> {
    const current = await this.findById(schoolId);
    if (!current) return null;
    if (current.tempJoinCode) return current;

    for (let attempt = 0; attempt < 12; attempt++) {
      const code = randomBytes(3).toString('hex').toUpperCase();
      const taken = await this.schoolModel.findOne({ tempJoinCode: code }).exec();
      if (taken) continue;
      await this.schoolModel.findByIdAndUpdate(schoolId, { $set: { tempJoinCode: code } }).exec();
      return this.findById(schoolId);
    }
    return current;
  }

  async findManyByIds(ids: string[]): Promise<SchoolEntity[]> {
    const schools = await this.schoolModel.find({ _id: { $in: ids } }).exec();
    return schools.map(s => SchoolEntity.fromDocument(s));
  }

  async update(id: string, school: SchoolEntity, expectedVersion?: number): Promise<SchoolEntity | null> {
    if (expectedVersion !== undefined) {
      const existing = await this.schoolModel.findById(id).exec();
      if (!existing) return null;

      const existingEntity = SchoolEntity.fromDocument(existing);
      if (existingEntity.hasConflict(expectedVersion)) {
        existingEntity.markAsConflict();
        await this.schoolModel.findByIdAndUpdate(id, { sync: existingEntity.sync }).exec();
        throw new ConflictException('Version conflict: document was modified by another operation');
      }
    }

    school.incrementVersion();
    school.markAsSynced();

    const updated = await this.schoolModel.findByIdAndUpdate(
      id,
      { ...school.toDocument(), updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updated) return null;
    return SchoolEntity.fromDocument(updated);
  }

  async remove(id: string): Promise<void> {
    await this.schoolModel.findByIdAndDelete(id).exec();
  }
}
