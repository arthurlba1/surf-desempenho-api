import { CommandInboxEntity } from '@/sync/domain/entities/command-inbox.entity';
import { CommandStatus } from '@/sync/schemas/command-inbox.schema';

export abstract class ICommandInboxRepositoryPort {
  abstract create(command: CommandInboxEntity): Promise<CommandInboxEntity>;
  abstract findByCommandId(commandId: string): Promise<CommandInboxEntity | null>;
  abstract updateStatus(
    commandId: string,
    status: CommandStatus,
    error?: string,
    result?: Record<string, any>,
  ): Promise<void>;
  abstract findByActorAndSequence(
    actorUserId: string,
    schoolId: string | undefined,
    clientSequence: number,
  ): Promise<CommandInboxEntity | null>;
}
