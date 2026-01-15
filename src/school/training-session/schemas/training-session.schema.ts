import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export enum TrainingSessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

export type TrainingSessionDocument = TrainingSession & Document;

@Schema({ _id: false })
export class Location {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  name: string;
}

@Schema({ _id: false })
export class SeaConditions {
  @Prop() seaType?: string;
  @Prop() seabed?: string;
  @Prop() swellConsistency?: string;
  @Prop() windInterference?: string;
  @Prop() crowdSituation?: string;
  @Prop() waterTemperature?: string;
  @Prop() nps?: number;
}

@Schema({ _id: false })
export class WaveConditions {
  @Prop() speed?: string;
  @Prop() waveShape?: string;
  @Prop() riskLevel?: string;
  @Prop() waveExtension?: string;
  @Prop() maneuveringOpportunities?: string;
  @Prop() dropCondition?: string;
  @Prop() nps?: number;
}

@Schema({ _id: false })
export class AudioMessage {
  @Prop({ required: true })
  id: string;

  @Prop({ required: false })
  recipientId?: string;

  @Prop({ required: true })
  audioUrl: string;

  @Prop({ required: true, default: Date.now })
  sentAt: Date;

  @Prop() duration?: number;
}

@Schema({ timestamps: true, _id: true })
export class TrainingSession {
  @Prop({ required: true, index: true })
  schoolId: string;

  @Prop({ required: true, index: true })
  createdBy: string;

  @Prop({
    enum: ['scheduled', 'in-progress', 'completed'],
    default: TrainingSessionStatus.SCHEDULED,
    required: true,
    index: true,
  })
  status: TrainingSessionStatus;

  @Prop() startTime?: Date;
  @Prop() endTime?: Date;

  @Prop() duration?: number;
  @Prop() totalDuration?: number;

  @Prop({ type: [String], required: true, default: [] })
  participants: string[];

  @Prop({ type: Location, required: false })
  location?: Location;

  @Prop({ type: SeaConditions, required: false })
  seaConditions?: SeaConditions;

  @Prop({ type: WaveConditions, required: false })
  waveConditions?: WaveConditions;

  @Prop({ type: [AudioMessage], default: [] })
  audioMessages?: AudioMessage[];

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const TrainingSessionSchema = SchemaFactory.createForClass(TrainingSession);
TrainingSessionSchema.index({ schoolId: 1, status: 1 });
TrainingSessionSchema.index({ schoolId: 1, createdBy: 1 });
TrainingSessionSchema.index({ participants: 1 });
