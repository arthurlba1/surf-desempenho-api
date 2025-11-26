import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: false })
export class SessionLocation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  lat?: number;

  @Prop({ required: false })
  log?: number;
}

export const SessionLocationSchema = SchemaFactory.createForClass(SessionLocation);
