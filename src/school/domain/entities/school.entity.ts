import { Sync, SyncStatus } from '@/common/schemas/sync.schema';

export class SchoolEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly inviteToken?: string,
    public readonly tempJoinCode?: string,
    public sync?: Sync,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    id?: string;
    name: string;
    ownerId: string;
    inviteToken?: string;
    tempJoinCode?: string;
    sync?: Sync;
    createdAt?: Date;
    updatedAt?: Date;
  }): SchoolEntity {
    const sync: Sync = data.sync || {
      status: SyncStatus.PENDING,
      version: 1,
      updatedAt: new Date(),
    };

    return new SchoolEntity(
      data.id || this.generateId(),
      data.name,
      data.ownerId,
      data.inviteToken || this.generateInviteToken(),
      data.tempJoinCode ?? this.generateTempJoinCode(),
      sync,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  static fromDocument(document: any): SchoolEntity {
    return new SchoolEntity(
      document._id?.toString() || document.id,
      document.name,
      document.ownerId || document.owner,
      document.inviteToken,
      document.tempJoinCode,
      document.sync || {
        status: SyncStatus.PENDING,
        version: 1,
        updatedAt: document.updatedAt || new Date(),
      },
      document.createdAt,
      document.updatedAt,
    );
  }

  toDocument(): any {
    return {
      ...(this.id && { _id: this.id }),
      name: this.name,
      ownerId: this.ownerId,
      inviteToken: this.inviteToken,
      tempJoinCode: this.tempJoinCode,
      sync: this.sync,
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

  private static generateId(): string {
    const { randomBytes } = require('crypto');
    return randomBytes(12).toString('hex');
  }

  private static generateInviteToken(): string {
    const { randomBytes } = require('crypto');
    return randomBytes(16).toString('hex');
  }

  /** TEMPORARY: 6-char code for join-by-code UI; remove with temp flow. */
  private static generateTempJoinCode(): string {
    const { randomBytes } = require('crypto');
    return randomBytes(3).toString('hex').toUpperCase();
  }
}
