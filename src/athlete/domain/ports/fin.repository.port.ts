import type { Fin } from '@/athlete/schemas/fin.schema';

export abstract class IFinRepositoryPort {
  abstract listByOwnerId(ownerId: string): Promise<Fin[]>;
  abstract create(fin: Partial<Fin>): Promise<Fin>;
  abstract updateByIdAndOwnerId(id: string, ownerId: string, patch: Partial<Fin>): Promise<Fin | null>;
  abstract deleteByIdAndOwnerId(id: string, ownerId: string): Promise<boolean>;
}
