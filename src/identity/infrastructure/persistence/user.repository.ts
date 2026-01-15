import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '@/identity/infrastructure/schemas/user.schema';
import { UserEntity } from '@/identity/domain/entities/user.entity';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const userDoc = new this.userModel(user.toDocument());
    const saved = await userDoc.save();
    const entity = UserEntity.fromDocument(saved);
    
    entity.markAsSynced();
    await this.userModel.findByIdAndUpdate(saved._id, { sync: entity.sync }).exec();
    
    return entity;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;
    return UserEntity.fromDocument(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;
    return UserEntity.fromDocument(user);
  }

  async findManyByIds(ids: string[]): Promise<UserEntity[]> {
    if (!ids || ids.length === 0) return [];
    const users = await this.userModel.find({ _id: { $in: ids } }).exec();
    return users.map((u) => UserEntity.fromDocument(u));
  }

  async update(id: string, user: UserEntity, expectedVersion?: number): Promise<UserEntity | null> {
    if (expectedVersion !== undefined) {
      const existing = await this.userModel.findById(id).exec();
      if (!existing) return null;

      const existingEntity = UserEntity.fromDocument(existing);
      if (existingEntity.hasConflict(expectedVersion)) {
        existingEntity.markAsConflict();
        await this.userModel.findByIdAndUpdate(id, { sync: existingEntity.sync }).exec();
        throw new ConflictException('Version conflict: document was modified by another operation');
      }
    }

    user.incrementVersion();
    user.markAsSynced();

    const updated = await this.userModel.findByIdAndUpdate(
      id,
      { ...user.toDocument(), updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updated) return null;
    return UserEntity.fromDocument(updated);
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async setCurrentActiveSchoolId(userId: string, schoolId: string): Promise<UserEntity | null> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { currentActiveSchoolId: schoolId, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updated) return null;
    const entity = UserEntity.fromDocument(updated);
    entity.incrementVersion();
    entity.markAsSynced();
    await this.userModel.findByIdAndUpdate(userId, { sync: entity.sync }).exec();
    return entity;
  }

  async findByVersion(id: string, version: number): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({
      _id: id,
      'sync.version': version,
    }).exec();

    if (!user) return null;
    return UserEntity.fromDocument(user);
  }
}
