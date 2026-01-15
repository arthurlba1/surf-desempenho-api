import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { CreateUserCommand } from './create-user.command';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { UserEntity } from '@/identity/domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase extends BaseUseCase<CreateUserCommand, UserEntity> {
  constructor(private readonly userRepository: IUserRepositoryPort) {
    super();
  }

  async handle(payload: CreateUserCommand): Promise<IUseCaseResponse<UserEntity>> {
    const { email, password, ...rest } = payload;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userEntity = UserEntity.create({
      id: payload.id,
      email,
      password: hashedPassword,
      ...rest,
    });

    const createdUser = await this.userRepository.create(userEntity);

    return this.ok('User created successfully', createdUser);
  }
}
