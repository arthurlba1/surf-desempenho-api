import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommandInbox, CommandInboxDocument } from '@/sync/schemas/command-inbox.schema';
import { CommandInboxEntity } from '@/sync/domain/entities/command-inbox.entity';
import { ICommandInboxRepositoryPort } from '@/sync/domain/ports/command-inbox.repository.port';
import { CommandStatus } from '@/sync/schemas/command-inbox.schema';

@Injectable()
export class CommandInboxRepository implements ICommandInboxRepositoryPort {
  constructor(
    @InjectModel(CommandInbox.name) private commandInboxModel: Model<CommandInboxDocument>,
  ) {}

  async create(command: CommandInboxEntity): Promise<CommandInboxEntity> {
    const commandDoc = new this.commandInboxModel(command.toDocument());
    const saved = await commandDoc.save();
    return CommandInboxEntity.fromDocument(saved);
  }

  async findByCommandId(commandId: string): Promise<CommandInboxEntity | null> {
    const command = await this.commandInboxModel.findOne({ commandId }).exec();
    if (!command) return null;
    return CommandInboxEntity.fromDocument(command);
  }

  async updateStatus(
    commandId: string,
    status: CommandStatus,
    error?: string,
    result?: Record<string, any>,
  ): Promise<void> {
    const update: any = { status };
    if (error !== undefined) {
      update.error = error;
    }
    if (result !== undefined) {
      update.result = result;
    }
    if (status === CommandStatus.APPLIED) {
      update.appliedAt = new Date();
    }

    await this.commandInboxModel.findOneAndUpdate({ commandId }, update).exec();
  }

  async findByActorAndSequence(
    actorUserId: string,
    schoolId: string | undefined,
    clientSequence: number,
  ): Promise<CommandInboxEntity | null> {
    const query: any = {
      actorUserId,
      clientSequence,
    };
    if (schoolId !== undefined) {
      query.schoolId = schoolId;
    } else {
      query.schoolId = { $exists: false };
    }

    const command = await this.commandInboxModel.findOne(query).exec();
    if (!command) return null;
    return CommandInboxEntity.fromDocument(command);
  }
}
