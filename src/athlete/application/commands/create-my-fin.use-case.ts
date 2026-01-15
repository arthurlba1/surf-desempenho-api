import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IFinRepositoryPort } from '@/athlete/domain/ports/fin.repository.port';
import { CreateMyFinCommand } from './create-my-fin.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

@Injectable()
export class CreateMyFinUseCase extends BaseUseCase<CreateMyFinCommand, any> {
  constructor(
    private readonly finRepository: IFinRepositoryPort,
  ) {
    super();
  }

  async handle(payload: CreateMyFinCommand, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const created = await this.finRepository.create({
      ownerId: auth.id,
      name: payload.name,
      model: payload.model,
      set: payload.set,
      size: payload.size,
      area: payload.area,
      rake: payload.rake,
      base: payload.base,
      height: payload.height,
      foil: payload.foil,
      material: payload.material,
      system: payload.system,
    });

    return this.ok('Fin created successfully', {
      id: asId(created),
      ownerId: created.ownerId,
      name: created.name,
      model: created.model,
      set: created.set,
      size: created.size,
      area: created.area,
      rake: created.rake,
      base: created.base,
      height: created.height,
      foil: created.foil,
      material: created.material,
      system: created.system,
    });
  }
}
