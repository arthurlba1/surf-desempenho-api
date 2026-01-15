import {
  TrainingSessionStatus,
  Location,
  SeaConditions,
  WaveConditions,
  AudioMessage,
} from '@/school/training-session/schemas/training-session.schema';

export class TrainingSessionResponse {
  id: string;
  schoolId: string;
  createdBy: string;
  status: TrainingSessionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  totalDuration?: number;
  participants: string[];
  location?: Location;
  seaConditions?: SeaConditions;
  waveConditions?: WaveConditions;
  audioMessages: AudioMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}
