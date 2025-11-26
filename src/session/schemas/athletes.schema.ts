import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: false })
export class SessionAthlete {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  profilePictureUrl?: string;
}
