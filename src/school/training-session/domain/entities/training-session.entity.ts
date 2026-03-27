import { randomBytes } from 'crypto';
import { Sync, SyncStatus } from '@/common/schemas/sync.schema';
import {
  TrainingSessionStatus,
  Location,
  SeaConditions,
  WaveConditions,
  AudioMessage,
  SelfEvaluation,
} from '@/school/training-session/schemas/training-session.schema';

export class TrainingSessionEntity {
  constructor(
    public readonly id: string,
    public readonly schoolId: string,
    public readonly createdBy: string,
    public status: TrainingSessionStatus,
    public startTime?: Date,
    public endTime?: Date,
    public duration?: number,
    public totalDuration?: number,
    public participants: string[] = [],
    public location?: Location,
    public seaConditions?: SeaConditions,
    public waveConditions?: WaveConditions,
    public audioMessages: AudioMessage[] = [],
    public sync?: Sync,
    public evaluatedParticipantsCount: number = 0,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public selfEvaluations: SelfEvaluation[] = [],
  ) {}

  static create(data: {
    id?: string;
    schoolId: string;
    createdBy: string;
    status?: TrainingSessionStatus;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    totalDuration?: number;
    participants?: string[];
    location?: Location;
    seaConditions?: SeaConditions;
    waveConditions?: WaveConditions;
    audioMessages?: AudioMessage[];
    sync?: Sync;
    evaluatedParticipantsCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    selfEvaluations?: SelfEvaluation[];
  }): TrainingSessionEntity {
    const sync: Sync = data.sync || {
      status: SyncStatus.PENDING,
      version: 1,
      updatedAt: new Date(),
    };

    return new TrainingSessionEntity(
      data.id || this.generateId(),
      data.schoolId,
      data.createdBy,
      data.status || TrainingSessionStatus.SCHEDULED,
      data.startTime,
      data.endTime,
      data.duration,
      data.totalDuration,
      data.participants || [],
      data.location,
      data.seaConditions,
      data.waveConditions,
      data.audioMessages || [],
      sync,
      data.evaluatedParticipantsCount ?? 0,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
      data.selfEvaluations || [],
    );
  }

  static fromDocument(document: any): TrainingSessionEntity {
    return new TrainingSessionEntity(
      document._id?.toString() || document.id,
      document.schoolId,
      document.createdBy,
      document.status || TrainingSessionStatus.SCHEDULED,
      document.startTime,
      document.endTime,
      document.duration,
      document.totalDuration,
      document.participants || [],
      document.location,
      document.seaConditions,
      document.waveConditions,
      document.audioMessages || [],
      document.sync || {
        status: SyncStatus.PENDING,
        version: 1,
        updatedAt: document.updatedAt || new Date(),
      },
      document.evaluatedParticipantsCount ?? 0,
      document.createdAt,
      document.updatedAt,
      document.selfEvaluations || [],
    );
  }

  toDocument(): any {
    return {
      ...(this.id && { _id: this.id }),
      schoolId: this.schoolId,
      createdBy: this.createdBy,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      totalDuration: this.totalDuration,
      participants: this.participants,
      location: this.location,
      seaConditions: this.seaConditions,
      waveConditions: this.waveConditions,
      audioMessages: this.audioMessages,
      selfEvaluations: this.selfEvaluations,
      sync: this.sync,
      evaluatedParticipantsCount: this.evaluatedParticipantsCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  markAsSynced(): void {
    if (this.sync) {
      this.sync.status = SyncStatus.SYNCED;
      this.sync.updatedAt = new Date();
    }
  }

  markAsConflict(): void {
    if (this.sync) {
      this.sync.status = SyncStatus.CONFLICT;
      this.sync.updatedAt = new Date();
    }
  }

  incrementVersion(): void {
    if (this.sync) {
      this.sync.version += 1;
      this.sync.updatedAt = new Date();
    }
  }

  hasConflict(version: number): boolean {
    return this.sync?.version !== version;
  }

  addAudioMessage(audioMessage: AudioMessage): void {
    this.audioMessages = [...this.audioMessages, audioMessage];
    this.incrementVersion();
  }

  private static generateId(): string {
    return randomBytes(12).toString('hex');
  }
}
