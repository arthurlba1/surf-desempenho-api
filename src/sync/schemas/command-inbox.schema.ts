import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CommandStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  APPLIED = 'APPLIED',
  FAILED = 'FAILED',
}

@Schema({ collection: 'command_inbox', timestamps: true })
export class CommandInbox extends Document {
  @Prop({ required: true, unique: true, index: true })
  commandId: string;

  @Prop({ required: true })
  commandType: string;

  @Prop({ required: true, index: true })
  actorUserId: string;

  @Prop({ index: true })
  schoolId?: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ required: true })
  clientSequence: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  receivedAt: Date;

  @Prop({ required: true, enum: CommandStatus, default: CommandStatus.RECEIVED, index: true })
  status: CommandStatus;

  @Prop()
  appliedAt?: Date;

  @Prop()
  error?: string;

  @Prop({ type: Object })
  result?: Record<string, any>;

  @Prop()
  version?: number;
}

export const CommandInboxSchema = SchemaFactory.createForClass(CommandInbox);

export type CommandInboxDocument = CommandInbox & Document;

CommandInboxSchema.index({ actorUserId: 1, schoolId: 1, clientSequence: 1 });
CommandInboxSchema.index({ status: 1, receivedAt: 1 });
