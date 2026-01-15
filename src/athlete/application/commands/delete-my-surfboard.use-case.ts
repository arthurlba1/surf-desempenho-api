import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { ISurfboardRepositoryPort } from '@/athlete/domain/ports/surfboard.repository.port';
import { DeleteMySurfboardResponse } from '@/athlete/application/responses/delete-my-surfboard.response';

@Injectable()
export class DeleteMySurfboardUseCase extends BaseUseCase<{ id: string }, DeleteMySurfboardResponse> {
  constructor(
    private readonly surfboardRepository: ISurfboardRepositoryPort,
  ) {
    super();
  }

  async handle(payload: { id: string }, auth?: AuthUser): Promise<IUseCaseResponse<DeleteMySurfboardResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const deleted = await this.surfboardRepository.deleteByIdAndOwnerId(payload.id, auth.id);
    return this.ok('Surfboard deleted successfully', new DeleteMySurfboardResponse(deleted));
  }
}
