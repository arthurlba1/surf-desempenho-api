import { Injectable, NotFoundException } from '@nestjs/common';

import { UserAuthResponseDto } from '@/auth/dtos/auth-response.dto';
import { UserRepository } from '@/users/repositories/user.repository';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return UserResponseDto.fromEntity(user);
  }

  async update(authUser: UserAuthResponseDto, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(authUser.id);
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.userRepository.update(user.id, data);
    if (!updatedUser) throw new NotFoundException('User not found');

    return UserResponseDto.fromEntity(updatedUser);
  }
}
