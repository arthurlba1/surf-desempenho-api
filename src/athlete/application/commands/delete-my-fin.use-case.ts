import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IFinRepositoryPort } from '@/athlete/domain/ports/fin.repository.port';
import { DeleteMyFinResponse } from '@/athlete/application/responses/delete-my-fin.response';

@Injectable()
export class DeleteMyFinUseCase extends BaseUseCase<{ id: string }, DeleteMyFinResponse> {
  constructor(
    private readonly finRepository: IFinRepositoryPort,
  ) {
    super();
  }

  async handle(payload: { id: string }, auth?: AuthUser): Promise<IUseCaseResponse<DeleteMyFinResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const deleted = await this.finRepository.deleteByIdAndOwnerId(payload.id, auth.id);
    return this.ok('Fin deleted successfully', new DeleteMyFinResponse(deleted));
  }
}
