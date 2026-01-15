import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { IFinRepositoryPort } from '@/athlete/domain/ports/fin.repository.port';
import { UpdateMyFinCommand } from './update-my-fin.command';

function asId(doc: any): string {
  return doc?._id?.toString?.() ?? doc?.id ?? '';
}

type Payload = UpdateMyFinCommand & { id: string };

@Injectable()
export class UpdateMyFinUseCase extends BaseUseCase<Payload, any> {
  constructor(
    private readonly finRepository: IFinRepositoryPort,
  ) {
    super();
  }

  async handle(payload: Payload, auth?: AuthUser): Promise<IUseCaseResponse<any>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const updated = await this.finRepository.updateByIdAndOwnerId(payload.id, auth.id, {
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

    if (!updated) throw new NotFoundException('Fin not found');

    return this.ok('Fin updated successfully', {
      id: asId(updated),
      ownerId: updated.ownerId,
      name: updated.name,
      model: updated.model,
      set: updated.set,
      size: updated.size,
      area: updated.area,
      rake: updated.rake,
      base: updated.base,
      height: updated.height,
      foil: updated.foil,
      material: updated.material,
      system: updated.system,
    });
  }
}
