import { ConflictException, NotFoundException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { UpdateUserCommand } from './update-user.command';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { UserEntity } from '@/identity/domain/entities/user.entity';
import type { AuthUser } from '@/common/types/auth.types';

@Injectable()
export class UpdateUserUseCase extends BaseUseCase<UpdateUserCommand & { id: string }, UserEntity> {
  constructor(private readonly userRepository: IUserRepositoryPort) {
    super();
  }

  async handle(payload: UpdateUserCommand, auth?: AuthUser): Promise<IUseCaseResponse<UserEntity>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');
    
    const { version, ...rest } = payload;

    const existingUser = await this.userRepository.findById(auth.id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (version !== undefined && existingUser.hasConflict(version)) {
      throw new ConflictException('Version conflict: document was modified by another operation');
    }

    const updatedEntity = UserEntity.create({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      password: existingUser.password,
      role: existingUser.role,
      profilePictureUrl: rest.profilePictureUrl ?? existingUser.profilePictureUrl,
      birthdate: rest.birthdate ?? existingUser.birthdate,
      document: rest.document ?? existingUser.document,
      currentActiveSchoolId: existingUser.currentActiveSchoolId,
      sync: existingUser.sync,
      createdAt: existingUser.createdAt,
      updatedAt: new Date(),
    });

    const updated = await this.userRepository.update(
      auth.id,
      updatedEntity,
      version
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return this.ok('User updated successfully', updated);
  }
}
