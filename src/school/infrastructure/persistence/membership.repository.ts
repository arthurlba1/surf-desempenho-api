import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Membership, MembershipDocument } from '@/school/schemas/membership.schema';
import { MembershipEntity } from '@/school/domain/entities/membership.entity';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';

@Injectable()
export class MembershipRepository implements IMembershipRepositoryPort {
  constructor(@InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>) {}

  async create(membership: MembershipEntity): Promise<MembershipEntity> {
    const membershipDoc = new this.membershipModel(membership.toDocument());
    const saved = await membershipDoc.save();
    const entity = MembershipEntity.fromDocument(saved);

    entity.markAsSynced();
    await this.membershipModel.findByIdAndUpdate(saved._id, { sync: entity.sync }).exec();
    
    return entity;
  }

  async findById(id: string): Promise<MembershipEntity | null> {
    const membership = await this.membershipModel.findById(id).exec();
    if (!membership) return null;
    return MembershipEntity.fromDocument(membership);
  }

  async findByUserIdAndSchoolId(userId: string, schoolId: string): Promise<MembershipEntity | null> {
    const membership = await this.membershipModel.findOne({ userId, schoolId }).exec();
    if (!membership) return null;
    return MembershipEntity.fromDocument(membership);
  }

  async findByUserId(userId: string): Promise<MembershipEntity[]> {
    const memberships = await this.membershipModel.find({ userId }).exec();
    return memberships.map(m => MembershipEntity.fromDocument(m));
  }

  async findBySchoolId(schoolId: string): Promise<MembershipEntity[]> {
    const memberships = await this.membershipModel.find({ schoolId }).exec();
    return memberships.map(m => MembershipEntity.fromDocument(m));
  }

  async update(id: string, membership: MembershipEntity, expectedVersion?: number): Promise<MembershipEntity | null> {
    if (expectedVersion !== undefined) {
      const existing = await this.membershipModel.findById(id).exec();
      if (!existing) return null;

      const existingEntity = MembershipEntity.fromDocument(existing);
      if (existingEntity.hasConflict(expectedVersion)) {
        existingEntity.markAsConflict();
        await this.membershipModel.findByIdAndUpdate(id, { sync: existingEntity.sync }).exec();
        throw new ConflictException('Version conflict: document was modified by another operation');
      }
    }

    membership.incrementVersion();
    membership.markAsSynced();

    const updated = await this.membershipModel.findByIdAndUpdate(
      id,
      { ...membership.toDocument(), updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updated) return null;
    return MembershipEntity.fromDocument(updated);
  }

  async remove(id: string): Promise<void> {
    await this.membershipModel.findByIdAndDelete(id).exec();
  }
}
