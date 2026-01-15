import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { ISurfboardRepositoryPort } from '@/athlete/domain/ports/surfboard.repository.port';
import { UpdateMySurfboardCommand } from './update-my-surfboard.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

type Payload = UpdateMySurfboardCommand & { id: string };

@Injectable()
export class UpdateMySurfboardUseCase extends BaseUseCase<Payload, any> {
  constructor(
    private readonly surfboardRepository: ISurfboardRepositoryPort,
  ) {
    super();
  }

  async handle(payload: Payload, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const updated = await this.surfboardRepository.updateByIdAndOwnerId(payload.id, auth.id, {
      name: payload.name,
      model: payload.model,
      size: payload.size,
      width: payload.width,
      fractionalInches: payload.fractionalInches,
      thickness: payload.thickness,
      volume: payload.volume,
      tail: payload.tail,
    });

    if (!updated) throw new NotFoundException('Surfboard not found');

    return this.ok('Surfboard updated successfully', {
      id: asId(updated),
      ownerId: updated.ownerId,
      name: updated.name,
      model: updated.model,
      size: updated.size,
      width: updated.width,
      fractionalInches: updated.fractionalInches,
      thickness: updated.thickness,
      volume: updated.volume,
      tail: updated.tail,
    });
  }
}
