import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
}

@Schema({ _id: false })
export class Sync {
  @Prop({ required: true, enum: SyncStatus, default: SyncStatus.PENDING })
  status: SyncStatus;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const SyncSchema = SchemaFactory.createForClass(Sync);
