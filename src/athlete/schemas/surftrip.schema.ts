import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sync, SyncSchema } from '@/common/schemas/sync.schema';

export type SurftripDocument = Surftrip & Document;

@Schema({ timestamps: true, _id: true })
export class Surftrip {
  @Prop({ required: true, index: true })
  athleteId: string; // AthleteProfile._id

  @Prop()
  name?: string;

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;

  @Prop()
  location?: string;

  @Prop({ type: [String], default: [] })
  quiver?: string[];

  @Prop({ enum: ['very bad', 'bad', 'good', 'very good'] })
  technicalPerformance?: string;

  @Prop({ enum: ['very bad', 'bad', 'good', 'very good'] })
  physicalPerformance?: string;
  @Prop({
    type: [
      {
        setupId: String,
        performance: { type: String, enum: ['very bad', 'bad', 'good', 'very good'] },
      },
    ],
    default: [],
  })
  performance?: Array<{ setupId: string; performance: string }>;

  @Prop()
  planning?: string;

  @Prop()
  accumulatedSkills?: string;

  @Prop({ type: Boolean, default: false })
  accompaniedByCoach?: boolean;

  @Prop({ type: SyncSchema, required: false })
  sync?: Sync;
}

export const SurftripSchema = SchemaFactory.createForClass(Surftrip);
SurftripSchema.index({ athleteId: 1 });
