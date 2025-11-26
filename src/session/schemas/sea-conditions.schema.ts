import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { SeaType } from '@/session/types/sea';

@Schema({ _id: false, timestamps: false, strict: false })
export class SeaConditions {
  @Prop({ enum: Object.values(SeaType), required: false })
  seaType?: SeaType;

  @Prop({ required: false })
  seabed?: string;

  @Prop({ required: false })
  swellConsistency?: string;

  @Prop({ required: false })
  windInterference?: string;

  @Prop({ required: false })
  crowdSituation?: string;

  @Prop({ required: false })
  waterTemperature?: string;

  @Prop({ required: false })
  nps?: number;
}

export const SeaConditionsSchema = SchemaFactory.createForClass(SeaConditions);