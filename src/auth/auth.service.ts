import { Injectable, BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { RegisterDto } from '@/auth/dtos/register.dto';
import { LoginDto } from '@/auth/dtos/login.dto';
import { UserRepository } from '@/users/repositories/user.repository';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { UserResponseDto } from '@/users/dtos/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, role, profilePicture, birthDate, document } = registerDto;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({ name, email, password: hashedPassword, role, profilePicture, birthDate, document });

    const accessToken = this.generateToken(user.id);
    return AuthResponseDto.fromToken(accessToken);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    
    const accessToken = this.generateToken(user.id);
    return AuthResponseDto.fromToken(accessToken);
  }

  async findLoggedUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return UserResponseDto.fromEntity(user);
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ id: userId });
  }
}
