import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IBoardSetupRepositoryPort } from '@/athlete/domain/ports/board-setup.repository.port';
import { CreateMyBoardSetupCommand } from './create-my-board-setup.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class CreateMyBoardSetupUseCase extends BaseUseCase<CreateMyBoardSetupCommand, any> {
  constructor(
    private readonly boardSetupRepository: IBoardSetupRepositoryPort,
  ) {
    super();
  }

  async handle(payload: CreateMyBoardSetupCommand, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const created = await this.boardSetupRepository.create({
      ownerId: auth.id,
      name: payload.name,
      surfboardId: payload.surfboardId,
      finIds: payload.finIds,
      notes: payload.notes,
    });

    return this.ok('Board setup created successfully', {
      id: asId(created),
      ownerId: created.ownerId,
      name: created.name,
      surfboardId: created.surfboardId,
      finIds: created.finIds,
      notes: created.notes,
    });
  }
}
