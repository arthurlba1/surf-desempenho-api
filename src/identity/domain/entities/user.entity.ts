import { randomBytes } from 'crypto';
import { Sync, SyncStatus } from '@/common/schemas/sync.schema';
import { UserRole } from '@/common/types/user-role.types';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly profilePictureUrl?: string,
    public readonly birthdate?: string,
    public readonly document?: string,
    public readonly currentActiveSchoolId?: string,
    public sync?: Sync,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    profilePictureUrl?: string;
    birthdate?: string;
    document?: string;
    currentActiveSchoolId?: string;
    sync?: Sync;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserEntity {
    const sync: Sync = data.sync || {
      status: SyncStatus.PENDING,
      version: 1,
      updatedAt: new Date(),
    };

    return new UserEntity(
      data.id || UserEntity.generateId(),
      data.name,
      data.email,
      data.password,
      data.role,
      data.profilePictureUrl,
      data.birthdate,
      data.document,
      data.currentActiveSchoolId,
      sync,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  static fromDocument(document: any): UserEntity {
    return new UserEntity(
      document._id?.toString() || document.id,
      document.name,
      document.email,
      document.password,
      document.role,
      document.profilePictureUrl,
      document.birthdate,
      document.document,
      document.currentActiveSchoolId,
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
      email: this.email,
      password: this.password,
      role: this.role,
      profilePictureUrl: this.profilePictureUrl,
      birthdate: this.birthdate,
      document: this.document,
      currentActiveSchoolId: this.currentActiveSchoolId,
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
    return randomBytes(12).toString('hex');
  }
}

