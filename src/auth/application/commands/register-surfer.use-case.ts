import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { RegisterCommand } from '@/auth/application/commands/register.command';
import { AuthResponse } from '@/auth/application/responses/auth.response';
import { CreateUserUseCase } from '@/identity/application/commands/create-user.use-case';
import { CreateUserCommand } from '@/identity/application/commands/create-user.command';

@Injectable()
export class RegisterSurferUseCase extends BaseUseCase<RegisterCommand, AuthResponse> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {
    super();
  }

  async handle(payload: RegisterCommand): Promise<IUseCaseResponse<AuthResponse>> {
    const createUserCommand: CreateUserCommand = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      profilePictureUrl: payload.profilePictureUrl,
      birthdate: payload.birthdate,
      document: payload.document,
    };

    const userResult = await this.createUserUseCase.handle(createUserCommand);
    const user = userResult.detail!;

    const accessToken = this.generateToken({
      id: user.id,
      email: user.email,
      currentActiveSchoolId: user.currentActiveSchoolId,
    });

    //TODO: Refactor this to use the UserResponseDto to simple call -> AuthResponse.from(accessToken, UserResponseDto.fromEntity(user));
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
      birthdate: user.birthdate,
      document: user.document,
      currentActiveSchoolId: user.currentActiveSchoolId,
      schools: [],
    };

    return this.ok('User created successfully', AuthResponse.from(accessToken, userResponse));
  }

  private generateToken(payload: { id: string; email: string; currentActiveSchoolId?: string }): string {
    return this.jwtService.sign(payload);
  }
}
