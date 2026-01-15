import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IBoardSetupRepositoryPort } from '@/athlete/domain/ports/board-setup.repository.port';
import { UpdateMyBoardSetupCommand } from './update-my-board-setup.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

type Payload = UpdateMyBoardSetupCommand & { id: string };

@Injectable()
export class UpdateMyBoardSetupUseCase extends BaseUseCase<Payload, any> {
  constructor(
    private readonly boardSetupRepository: IBoardSetupRepositoryPort,
  ) {
    super();
  }

  async handle(payload: Payload, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const updated = await this.boardSetupRepository.updateByIdAndOwnerId(payload.id, auth.id, {
      name: payload.name,
      surfboardId: payload.surfboardId,
      finIds: payload.finIds,
      notes: payload.notes,
    });

    if (!updated) throw new NotFoundException('Board setup not found');

    return this.ok('Board setup updated successfully', {
      id: asId(updated),
      ownerId: updated.ownerId,
      name: updated.name,
      surfboardId: updated.surfboardId,
      finIds: updated.finIds,
      notes: updated.notes,
    });
  }
}
