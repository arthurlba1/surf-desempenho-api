import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import { AuthResponseDto } from "@/auth/dtos/auth-response.dto";
import { LoginDto } from "@/auth/dtos/login.dto";
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { IUserRepository } from "@/users/repositories/user.repository.interface";

@Injectable()
export class LoginUseCase extends BaseUseCase<LoginDto, AuthResponseDto> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepository,
  ) { super() }

  async handle(payload: LoginDto): Promise<IUseCaseResponse<AuthResponseDto>> {
    const { email, password } = payload;

    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) throw new ConflictException('Email or password is incorrect');

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) throw new ConflictException('Email or password is incorrect');

    const accessToken = this.generateToken({ id: existingUser.id, email: existingUser.email, currentActiveSchoolId: existingUser.currentActiveSchoolId });
    return this.ok('User logged in successfully', AuthResponseDto.fromToken(accessToken));
  }

  private generateToken(payload: { id: string; email: string; currentActiveSchoolId?: string }): string {
    return this.jwtService.sign(payload);
  }
}
