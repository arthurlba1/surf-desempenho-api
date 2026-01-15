import type { BoardSetup } from '@/athlete/schemas/board-setup.schema';

export abstract class IBoardSetupRepositoryPort {
  abstract listByOwnerId(ownerId: string): Promise<BoardSetup[]>;
  abstract create(setup: Partial<BoardSetup>): Promise<BoardSetup>;
  abstract updateByIdAndOwnerId(id: string, ownerId: string, patch: Partial<BoardSetup>): Promise<BoardSetup | null>;
  abstract deleteByIdAndOwnerId(id: string, ownerId: string): Promise<boolean>;
}
