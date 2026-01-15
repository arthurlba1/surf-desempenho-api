import { NotFoundException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { UserEntity } from '@/identity/domain/entities/user.entity';

@Injectable()
export class GetUserLoginByEmailUseCase extends BaseUseCase<GetUserByEmailQuery, UserEntity> {
  constructor(private readonly userRepository: IUserRepositoryPort) {
    super();
  }

  async handle(payload: GetUserByEmailQuery): Promise<IUseCaseResponse<UserEntity>> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException('Email or password is incorrect');
    }

    return this.ok('User retrieved successfully', user);
  }
}
