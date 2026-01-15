import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type CompetitiveRecordDocument = CompetitiveRecord & Document;

@Schema({ timestamps: true, _id: true })
export class CompetitiveRecord {
  @Prop({ required: true, index: true })
  athleteId: string; // AthleteProfile._id

  @Prop() name?: string;
  @Prop() date?: string;
  @Prop() country?: string;
  @Prop() city?: string;
  @Prop() beach?: string;
  @Prop() peakName?: string;
  @Prop() responsibleAssociation?: string;
  @Prop() placement?: string;
  @Prop() prize?: string;
  @Prop({ type: [String], default: [] })
  equipments?: string[];

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const CompetitiveRecordSchema = SchemaFactory.createForClass(CompetitiveRecord);
CompetitiveRecordSchema.index({ athleteId: 1 });
