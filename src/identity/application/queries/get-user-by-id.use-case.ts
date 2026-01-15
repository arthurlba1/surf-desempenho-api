import { NotFoundException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { UserEntity } from '@/identity/domain/entities/user.entity';

@Injectable()
export class GetUserByIdUseCase extends BaseUseCase<GetUserByIdQuery, UserEntity> {
  constructor(private readonly userRepository: IUserRepositoryPort) {
    super();
  }

  async handle(payload: GetUserByIdQuery): Promise<IUseCaseResponse<UserEntity>> {
    const user = await this.userRepository.findById(payload.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.ok('User retrieved successfully', user);
  }
}
