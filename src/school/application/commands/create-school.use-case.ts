import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { CreateSchoolCommand } from './create-school.command';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { SchoolEntity } from '@/school/domain/entities/school.entity';

@Injectable()
export class CreateSchoolUseCase extends BaseUseCase<CreateSchoolCommand, SchoolEntity> {
  constructor(private readonly schoolRepository: ISchoolRepositoryPort) {
    super();
  }

  async handle(payload: CreateSchoolCommand): Promise<IUseCaseResponse<SchoolEntity>> {
    const schoolEntity = SchoolEntity.create({
      id: payload.id,
      name: payload.name,
      ownerId: payload.ownerId,
    });

    const created = await this.schoolRepository.create(schoolEntity);

    return this.ok('School created successfully', created);
  }
}
