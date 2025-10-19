import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import { AuthResponseDto } from "@/auth/dtos/auth-response.dto";
import { LoginDto } from "@/auth/dtos/login.dto";
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { IUserRepository } from "@/users/repositories/user.repository.interface";
import { AuthUser } from "@/common/types/auth.types";
import { UserResponseDto } from "@/users/dtos/user-response.dto";

@Injectable()
export class LoggedUseCase extends BaseUseCase<{}, UserResponseDto> {
  constructor(private readonly userRepository: IUserRepository) { super() }

  async handle(_payload: unknown, auth: AuthUser): Promise<IUseCaseResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(auth.id);
    if (!user) throw new ConflictException('User not found');

    return this.ok('User fetched successfully', UserResponseDto.fromEntity(user));
  }
}
