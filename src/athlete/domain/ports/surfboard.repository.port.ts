import type { Surfboard } from '@/athlete/schemas/surfboard.schema';

export abstract class ISurfboardRepositoryPort {
  abstract listByOwnerId(ownerId: string): Promise<Surfboard[]>;
  abstract create(board: Partial<Surfboard>): Promise<Surfboard>;
  abstract updateByIdAndOwnerId(id: string, ownerId: string, patch: Partial<Surfboard>): Promise<Surfboard | null>;
  abstract deleteByIdAndOwnerId(id: string, ownerId: string): Promise<boolean>;
}
