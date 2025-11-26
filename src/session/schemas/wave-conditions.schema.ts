import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: false, strict: false })
export class WaveConditions {
  @Prop({ required: false })
  speed?: string;

  @Prop({ required: false })
  waveShape?: string;

  @Prop({ required: false })
  riskLevel?: string;

  @Prop({ required: false })
  waveExtension?: string;

  @Prop({ required: false })
  maneuveringOpportunities?: string;

  @Prop({ required: false })
  dropCondition?: string;

  @Prop({ required: false })
  nps?: number;
}

export const WaveConditionsSchema = SchemaFactory.createForClass(WaveConditions);