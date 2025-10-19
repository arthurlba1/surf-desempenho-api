import { ConflictException, Injectable } from "@nestjs/common";

import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { AuthUser } from "@/common/types/auth.types";
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { UpdateUserDto } from "@/users/dtos/update-user.dto";
import { UserResponseDto } from "@/users/dtos/user-response.dto";
import { IUserRepository } from "@/users/repositories/user.repository.interface";


@Injectable()
export class UpdateUserInformationsUseCase extends BaseUseCase<UpdateUserDto, UserResponseDto> {
  constructor(private readonly userRepository: IUserRepository) { super() }

  async handle(payload: UpdateUserDto, auth: AuthUser): Promise<IUseCaseResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(auth.id);
    if (!user) throw new ConflictException('User not found');
  
    const updatedUser = await this.userRepository.update(user.id, payload);
    if (!updatedUser) throw new ConflictException('User not found');

    return this.ok('User updated successfully', UserResponseDto.fromEntity(updatedUser));
  }
}
