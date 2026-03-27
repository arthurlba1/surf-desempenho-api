import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { CreateSchoolCommand } from './create-school.command';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { SchoolEntity } from '@/school/domain/entities/school.entity';

const DUPLICATE_KEY = 11000;

@Injectable()
export class CreateSchoolUseCase extends BaseUseCase<CreateSchoolCommand, SchoolEntity> {
  constructor(private readonly schoolRepository: ISchoolRepositoryPort) {
    super();
  }

  async handle(payload: CreateSchoolCommand): Promise<IUseCaseResponse<SchoolEntity>> {
    const maxAttempts = 8;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const schoolEntity = SchoolEntity.create({
        id: payload.id,
        name: payload.name,
        ownerId: payload.ownerId,
      });
      try {
        const created = await this.schoolRepository.create(schoolEntity);
        return this.ok('School created successfully', created);
      } catch (e: unknown) {
        const code = (e as { code?: number })?.code;
        if (code === DUPLICATE_KEY && attempt < maxAttempts - 1) {
          continue;
        }
        throw e;
      }
    }
    throw new Error('Failed to create school after retries');
  }
}
