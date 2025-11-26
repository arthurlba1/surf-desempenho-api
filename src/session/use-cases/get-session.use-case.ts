import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { AuthUser } from '@/common/types/auth.types';
import { ISessionRepository } from '@/session/repositories/session.repository.interface';
import { SessionResponseDto } from '@/session/dtos/session-response.dto';

@Injectable()
export class GetSessionUseCase extends BaseUseCase<{ id: string }, SessionResponseDto> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
  ) { super() }

  async handle(payload: { id: string }, auth: AuthUser): Promise<IUseCaseResponse<SessionResponseDto>> {
    if (!auth?.currentActiveSchoolId) throw new UnauthorizedException('No active school');

    const session = await this.sessionRepository.findById(payload.id);
    if (!session || session.schoolId !== auth.currentActiveSchoolId) {
      throw new ConflictException('Session not found');
    }

    return this.ok('Session fetched successfully', SessionResponseDto.fromEntity(session));
  }
}
