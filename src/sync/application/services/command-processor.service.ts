import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';

import { SyncCommand } from '@/sync/application/commands/sync-commands.command';
import { CreateUserUseCase } from '@/identity/application/commands/create-user.use-case';
import { CreateUserCommand } from '@/identity/application/commands/create-user.command';
import { UpdateUserUseCase } from '@/identity/application/commands/update-user.use-case';
import { UpdateUserCommand } from '@/identity/application/commands/update-user.command';
import { CreateSchoolUseCase } from '@/school/application/commands/create-school.use-case';
import { CreateSchoolCommand } from '@/school/application/commands/create-school.command';
import { CreateMembershipUseCase } from '@/school/application/commands/create-membership.use-case';
import { CreateMembershipCommand } from '@/school/application/commands/create-membership.command';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';
import type { AuthUser } from '@/common/types/auth.types';
import { CreateMyCompetitiveRecordUseCase } from '@/athlete/application/commands/create-my-competitive-record.use-case';
import { CreateMyCompetitiveRecordCommand } from '@/athlete/application/commands/create-my-competitive-record.command';
import { CreateMySurftripUseCase } from '@/athlete/application/commands/create-my-surftrip.use-case';
import { CreateMySurftripCommand } from '@/athlete/application/commands/create-my-surftrip.command';
import { CreateMySurfboardUseCase } from '@/athlete/application/commands/create-my-surfboard.use-case';
import { CreateMySurfboardCommand } from '@/athlete/application/commands/create-my-surfboard.command';
import { CreateMyFinUseCase } from '@/athlete/application/commands/create-my-fin.use-case';
import { CreateMyFinCommand } from '@/athlete/application/commands/create-my-fin.command';
import { CreateMyBoardSetupUseCase } from '@/athlete/application/commands/create-my-board-setup.use-case';
import { CreateMyBoardSetupCommand } from '@/athlete/application/commands/create-my-board-setup.command';
import { CreateTrainingSessionUseCase } from '@/school/training-session/application/commands/create-training-session.use-case';
import { CreateTrainingSessionCommand } from '@/school/training-session/application/commands/create-training-session.command';

export interface CommandProcessResult {
  success: boolean;
  result?: any;
  error?: string;
  conflict?: {
    field: string;
    clientVersion: number;
    serverVersion: number;
  };
}

@Injectable()
export class CommandProcessorService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly createSchoolUseCase: CreateSchoolUseCase,
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly createMyCompetitiveRecordUseCase: CreateMyCompetitiveRecordUseCase,
    private readonly createMySurftripUseCase: CreateMySurftripUseCase,
    private readonly createMySurfboardUseCase: CreateMySurfboardUseCase,
    private readonly createMyFinUseCase: CreateMyFinUseCase,
    private readonly createMyBoardSetupUseCase: CreateMyBoardSetupUseCase,
    private readonly createTrainingSessionUseCase: CreateTrainingSessionUseCase,
  ) {}

  async processCommand(command: SyncCommand): Promise<CommandProcessResult> {
    try {
      switch (command.commandType) {
        case 'CREATE_USER':
          return await this.processCreateUser(command);
        case 'UPDATE_PROFILE':
          return await this.processUpdateProfile(command);
        case 'CREATE_SCHOOL':
          return await this.processCreateSchool(command);
        case 'CREATE_MEMBERSHIP':
          return await this.processCreateMembership(command);
        case 'CREATE_COMPETITIVE_RECORD':
          return await this.processCreateCompetitiveRecord(command);
        case 'CREATE_SURFTRIP':
          return await this.processCreateSurftrip(command);
        case 'CREATE_SURFBOARD':
          return await this.processCreateSurfboard(command);
        case 'CREATE_FIN':
          return await this.processCreateFin(command);
        case 'CREATE_BOARD_SETUP':
          return await this.processCreateBoardSetup(command);
        case 'CREATE_TRAINING_SESSION':
          return await this.processCreateTrainingSession(command);
        default:
          return {
            success: false,
            error: `Unknown command type: ${command.commandType}`,
          };
      }
    } catch (error: any) {
      if (error instanceof ConflictException) {
        const conflictMatch = error.message?.match(/version conflict/i);
        if (conflictMatch && command.version !== undefined) {
          return {
            success: false,
            error: error.message,
            conflict: {
              field: 'version',
              clientVersion: command.version,
              serverVersion: command.version + 1,
            },
          };
        }
        return {
          success: false,
          error: error.message || 'Conflict occurred',
        };
      }
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  private async processCreateUser(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateUserCommand;
    const createCommand: CreateUserCommand = {
      id: command.payload.id || undefined,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      profilePictureUrl: payload.profilePictureUrl,
      birthdate: payload.birthdate,
      document: payload.document,
    };

    const result = await this.createUserUseCase.handle(createCommand);
    return {
      success: true,
      result: {
        id: result.detail?.id,
        email: result.detail?.email,
      },
    };
  }

  private async processUpdateProfile(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as UpdateUserCommand;
    const updateCommand: UpdateUserCommand = {
      profilePictureUrl: payload.profilePictureUrl,
      birthdate: payload.birthdate,
      document: payload.document,
      version: command.version,
    };

    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId,
    };
    const result = await this.updateUserUseCase.handle(updateCommand, authUser);

    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }

  private async processCreateSchool(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateSchoolCommand;
    const createCommand: CreateSchoolCommand = {
      id: command.payload.id || undefined,
      name: payload.name,
      ownerId: command.actorUserId,
    };

    const result = await this.createSchoolUseCase.handle(createCommand);
    return {
      success: true,
      result: {
        id: result.detail?.id,
        name: result.detail?.name,
      },
    };
  }

  private async processCreateMembership(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateMembershipCommand;
    const createCommand: CreateMembershipCommand = {
      userId: payload.userId || command.actorUserId,
      schoolId: payload.schoolId || command.schoolId!,
      role: payload.role,
      status: payload.status || MembershipStatus.PENDING,
    };

    const result = await this.createMembershipUseCase.handle(createCommand);
    return {
      success: true,
      result: {
        id: result.detail?.id,
        userId: result.detail?.userId,
        schoolId: result.detail?.schoolId,
      },
    };
  }

  private async processCreateCompetitiveRecord(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateMyCompetitiveRecordCommand;
    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId || undefined,
    };

    const result = await this.createMyCompetitiveRecordUseCase.handle(payload, authUser);
    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }

  private async processCreateSurftrip(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateMySurftripCommand;
    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId || undefined,
    };

    const result = await this.createMySurftripUseCase.handle(payload, authUser);
    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }

  private async processCreateSurfboard(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateMySurfboardCommand;
    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId || undefined,
    };

    const result = await this.createMySurfboardUseCase.handle(payload, authUser);
    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }

  private async processCreateFin(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateMyFinCommand;
    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId || undefined,
    };

    const result = await this.createMyFinUseCase.handle(payload, authUser);
    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }

  private async processCreateBoardSetup(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateMyBoardSetupCommand;
    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId || undefined,
    };

    const result = await this.createMyBoardSetupUseCase.handle(payload, authUser);
    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }

  private async processCreateTrainingSession(command: SyncCommand): Promise<CommandProcessResult> {
    const payload = command.payload as CreateTrainingSessionCommand;
    const authUser: AuthUser = {
      id: command.actorUserId,
      email: '',
      currentActiveSchoolId: command.schoolId || undefined,
    };

    const result = await this.createTrainingSessionUseCase.handle(payload, authUser);
    return {
      success: true,
      result: {
        id: result.detail?.id,
      },
    };
  }
}
