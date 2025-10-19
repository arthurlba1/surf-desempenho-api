import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import { AuthResponseDto } from "@/auth/dtos/auth-response.dto";
import { RegisterDto } from "@/auth/dtos/register.dto";
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { IUserRepository } from "@/users/repositories/user.repository.interface";

@Injectable()
export class RegisterSurferUseCase extends BaseUseCase<RegisterDto, AuthResponseDto> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepository,
  ) { super() }

  async handle(payload: RegisterDto): Promise<IUseCaseResponse<AuthResponseDto>> {
    const { email, password } = payload;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new ConflictException('User already exists');

    /* Create user */
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({ ...payload, password: hashedPassword });

    const accessToken = this.generateToken({ id: user.id, email: user.email, currentActiveSchoolId: user.currentActiveSchoolId });
    return this.ok('User created successfully', AuthResponseDto.fromToken(accessToken));
  }

  private generateToken(payload: { id: string; email: string; currentActiveSchoolId?: string }): string {
    return this.jwtService.sign(payload);
  }
}
