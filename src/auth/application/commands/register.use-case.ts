import { BadRequestException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { RegisterCommand } from '@/auth/application/commands/register.command';
import { AuthResponse } from '@/auth/application/responses/auth.response';
import { RegisterSurferUseCase } from '@/auth/application/commands/register-surfer.use-case';
import { RegisterCoachUseCase } from '@/auth/application/commands/register-coach.use-case';
import { UserRole } from '@/common/types/user-role.types';

@Injectable()
export class RegisterUseCase extends BaseUseCase<RegisterCommand, AuthResponse> {
  constructor(
    private readonly registerSurferUseCase: RegisterSurferUseCase,
    private readonly registerCoachUseCase: RegisterCoachUseCase,
  ) {
    super();
  }

  async handle(payload: RegisterCommand): Promise<IUseCaseResponse<AuthResponse>> {
    if (payload.role === UserRole.COACH) {
      return await this.registerCoachUseCase.handle(payload);
    }
    
    if (payload.role === UserRole.SURFER) {
      return await this.registerSurferUseCase.handle(payload);
    }

    throw new BadRequestException('Invalid role');
  }
}
