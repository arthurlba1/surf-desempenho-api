import { randomBytes } from 'crypto';
import { Sync, SyncStatus } from '@/common/schemas/sync.schema';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';

export class MembershipEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly schoolId: string,
    public readonly role: MembershipRole,
    public status: MembershipStatus,
    public sync?: Sync,
    public readonly joinedAt?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    id?: string;
    userId: string;
    schoolId: string;
    role: MembershipRole;
    status?: MembershipStatus;
    sync?: Sync;
    joinedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): MembershipEntity {
    const sync: Sync = data.sync || {
      status: SyncStatus.PENDING,
      version: 1,
      updatedAt: new Date(),
    };

    return new MembershipEntity(
      data.id || this.generateId(),
      data.userId,
      data.schoolId,
      data.role,
      data.status || MembershipStatus.PENDING,
      sync,
      data.joinedAt || new Date(),
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  static fromDocument(document: any): MembershipEntity {
    return new MembershipEntity(
      document._id?.toString() || document.id,
      document.userId,
      document.schoolId,
      document.role,
      document.status || MembershipStatus.PENDING,
      document.sync || {
        status: SyncStatus.PENDING,
        version: 1,
        updatedAt: document.updatedAt || new Date(),
      },
      document.joinedAt,
      document.createdAt,
      document.updatedAt,
    );
  }

  toDocument(): any {
    return {
      ...(this.id && { _id: this.id }),
      userId: this.userId,
      schoolId: this.schoolId,
      role: this.role,
      status: this.status,
      sync: this.sync,
      joinedAt: this.joinedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  markAsActive(): void {
    this.status = MembershipStatus.ACTIVE;
    this.incrementVersion();
    this.markAsSynced();
  }

  markAsBlocked(): void {
    this.status = MembershipStatus.BLOCKED;
    this.incrementVersion();
    this.markAsSynced();
  }

  markAsPending(): void {
    this.status = MembershipStatus.PENDING;
    this.incrementVersion();
    this.markAsSynced();
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
    return randomBytes(12).toString('hex');
  }
}
