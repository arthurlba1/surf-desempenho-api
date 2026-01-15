import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { ISurfboardRepositoryPort } from '@/athlete/domain/ports/surfboard.repository.port';
import { CreateMySurfboardCommand } from './create-my-surfboard.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class CreateMySurfboardUseCase extends BaseUseCase<CreateMySurfboardCommand, any> {
  constructor(
    private readonly surfboardRepository: ISurfboardRepositoryPort,
  ) {
    super();
  }

  async handle(payload: CreateMySurfboardCommand, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const created = await this.surfboardRepository.create({
      ownerId: auth.id,
      name: payload.name,
      model: payload.model,
      size: payload.size,
      width: payload.width,
      fractionalInches: payload.fractionalInches,
      thickness: payload.thickness,
      volume: payload.volume,
      tail: payload.tail,
    });

    return this.ok('Surfboard created successfully', {
      id: asId(created),
      ownerId: created.ownerId,
      name: created.name,
      model: created.model,
      size: created.size,
      width: created.width,
      fractionalInches: created.fractionalInches,
      thickness: created.thickness,
      volume: created.volume,
      tail: created.tail,
    });
  }
}
