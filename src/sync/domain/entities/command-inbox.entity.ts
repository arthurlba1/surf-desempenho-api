import { CommandStatus } from '@/sync/schemas/command-inbox.schema';

export class CommandInboxEntity {
  constructor(
    public readonly id: string,
    public readonly commandId: string,
    public readonly commandType: string,
    public readonly actorUserId: string,
    public readonly payload: Record<string, any>,
    public readonly clientSequence: number,
    public readonly createdAt: Date,
    public readonly receivedAt: Date,
    public status: CommandStatus,
    public readonly schoolId?: string,
    public appliedAt?: Date,
    public error?: string,
    public result?: Record<string, any>,
    public version?: number,
  ) {}

  static fromDocument(document: any): CommandInboxEntity {
    return new CommandInboxEntity(
      document._id?.toString() || document.id,
      document.commandId,
      document.commandType,
      document.actorUserId,
      document.payload,
      document.clientSequence,
      document.createdAt,
      document.receivedAt,
      document.status,
      document.schoolId,
      document.appliedAt,
      document.error,
      document.result,
      document.version,
    );
  }

  toDocument(): any {
    return {
      ...(this.id && { _id: this.id }),
      commandId: this.commandId,
      commandType: this.commandType,
      actorUserId: this.actorUserId,
      schoolId: this.schoolId,
      payload: this.payload,
      clientSequence: this.clientSequence,
      createdAt: this.createdAt,
      receivedAt: this.receivedAt,
      status: this.status,
      appliedAt: this.appliedAt,
      error: this.error,
      result: this.result,
      version: this.version,
    };
  }

  markAsProcessing(): void {
    this.status = CommandStatus.PROCESSING;
  }

  markAsApplied(result?: Record<string, any>): void {
    this.status = CommandStatus.APPLIED;
    this.appliedAt = new Date();
    if (result) {
      this.result = result;
    }
  }

  markAsFailed(error: string): void {
    this.status = CommandStatus.FAILED;
    this.error = error;
  }
}
