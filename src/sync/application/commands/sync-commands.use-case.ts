import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { SyncCommandsCommand, SyncCommand } from './sync-commands.command';
import { SyncCommandsResponse } from '@/sync/application/responses/sync-commands.response';
import { ICommandInboxRepositoryPort } from '@/sync/domain/ports/command-inbox.repository.port';
import { CommandProcessorService } from '@/sync/application/services/command-processor.service';
import { CommandInboxEntity } from '@/sync/domain/entities/command-inbox.entity';
import { CommandStatus } from '@/sync/schemas/command-inbox.schema';

@Injectable()
export class SyncCommandsUseCase extends BaseUseCase<SyncCommandsCommand, SyncCommandsResponse> {
  constructor(
    private readonly commandInboxRepository: ICommandInboxRepositoryPort,
    private readonly commandProcessor: CommandProcessorService,
  ) {
    super();
  }

  async handle(payload: SyncCommandsCommand): Promise<IUseCaseResponse<SyncCommandsResponse>> {
    const { commands } = payload;

    const sortedCommands = [...commands].sort((a, b) => a.clientSequence - b.clientSequence);

    const processed: string[] = [];
    const failed: Array<{ commandId: string; error: string }> = [];
    const conflicts: Array<{
      commandId: string;
      field: string;
      clientVersion: number;
      serverVersion: number;
    }> = [];

    for (const command of sortedCommands) {
      try {
        const existing = await this.commandInboxRepository.findByCommandId(command.commandId);

        if (existing) {
          if (existing.status === CommandStatus.APPLIED) {
            processed.push(command.commandId);
            continue;
          }

          if (existing.status === CommandStatus.PROCESSING) {
            failed.push({
              commandId: command.commandId,
              error: 'Command is already being processed',
            });
            continue;
          }

          if (existing.status === CommandStatus.FAILED) {
            await this.commandInboxRepository.updateStatus(
              command.commandId,
              CommandStatus.PROCESSING,
            );
          }
        } else {
          const commandEntity = new CommandInboxEntity(
            '',
            command.commandId,
            command.commandType,
            command.actorUserId,
            command.payload,
            command.clientSequence,
            new Date(command.createdAt),
            new Date(),
            CommandStatus.PROCESSING,
            command.schoolId,
          );

          await this.commandInboxRepository.create(commandEntity);
        }

        const processResult = await this.commandProcessor.processCommand(command);

        if (processResult.success) {
          await this.commandInboxRepository.updateStatus(
            command.commandId,
            CommandStatus.APPLIED,
            undefined,
            processResult.result,
          );
          processed.push(command.commandId);
        } else {
          if (processResult.conflict) {
            conflicts.push({
              commandId: command.commandId,
              field: processResult.conflict.field,
              clientVersion: processResult.conflict.clientVersion,
              serverVersion: processResult.conflict.serverVersion,
            });
          }

          await this.commandInboxRepository.updateStatus(
            command.commandId,
            CommandStatus.FAILED,
            processResult.error,
          );
          failed.push({
            commandId: command.commandId,
            error: processResult.error || 'Unknown error',
          });
        }
      } catch (error: any) {
        await this.commandInboxRepository.updateStatus(
          command.commandId,
          CommandStatus.FAILED,
          error.message || 'Unexpected error',
        );
        failed.push({
          commandId: command.commandId,
          error: error.message || 'Unexpected error occurred',
        });
      }
    }

    const response: SyncCommandsResponse = {
      processed,
      failed,
      conflicts,
      serverTime: new Date().toISOString(),
    };

    return this.ok('Commands processed', response);
  }
}
