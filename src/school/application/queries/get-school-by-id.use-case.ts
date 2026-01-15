import { NotFoundException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { GetSchoolByIdQuery } from './get-school-by-id.query';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { SchoolEntity } from '@/school/domain/entities/school.entity';

@Injectable()
export class GetSchoolByIdUseCase extends BaseUseCase<GetSchoolByIdQuery, SchoolEntity> {
  constructor(private readonly schoolRepository: ISchoolRepositoryPort) {
    super();
  }

  async handle(payload: GetSchoolByIdQuery): Promise<IUseCaseResponse<SchoolEntity>> {
    const school = await this.schoolRepository.findById(payload.id);

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return this.ok('School retrieved successfully', school);
  }
}
