import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IBoardSetupRepositoryPort } from '@/athlete/domain/ports/board-setup.repository.port';
import { DeleteMyBoardSetupResponse } from '@/athlete/application/responses/delete-my-board-setup.response';

@Injectable()
export class DeleteMyBoardSetupUseCase extends BaseUseCase<{ id: string }, DeleteMyBoardSetupResponse> {
  constructor(
    private readonly boardSetupRepository: IBoardSetupRepositoryPort,
  ) {
    super();
  }

  async handle(payload: { id: string }, auth?: AuthUser): Promise<IUseCaseResponse<DeleteMyBoardSetupResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const deleted = await this.boardSetupRepository.deleteByIdAndOwnerId(payload.id, auth.id);
    return this.ok('Board setup deleted successfully', new DeleteMyBoardSetupResponse(deleted));
  }
}
