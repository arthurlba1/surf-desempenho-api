import { ConflictException, Injectable } from "@nestjs/common";
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import { AuthResponseDto } from "@/auth/dtos/auth-response.dto";
import { RegisterDto } from "@/auth/dtos/register.dto";
import { IUseCaseResponse } from "@/common/types/use-case-response";
import { BaseUseCase } from "@/common/use-cases/use-case-handle";
import { IMembershipRepository } from "@/memberships/repositories/membership.repository.interface";
import { MembershipRole } from "@/memberships/schemas/membership.schema";
import { IUserRepository } from "@/users/repositories/user.repository.interface";
import { ISchoolRepository } from "@/school/repositories/school.repository.interface";

@Injectable()
export class RegisterCoachUseCase extends BaseUseCase<RegisterDto, AuthResponseDto> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly schoolRepository: ISchoolRepository,
    @InjectConnection() private readonly connection: Connection,
  ) { super() }

  async handle(payload: RegisterDto): Promise<IUseCaseResponse<AuthResponseDto>> {
    const { email, password } = payload;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new ConflictException('User already exists');

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      /* Create user */
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.userRepository.create({ ...payload, password: hashedPassword }, session);

      /* Create owner school for the coach user */
      const school = await this.schoolRepository.create({ name: `${payload.name}'s School`, owner: user.id, onHold: true } as any, session);

      /* Create membership for the user in the school */
      await this.membershipRepository.create({ userId: user.id, schoolId: school.id, role: MembershipRole.COACH }, session);

      await this.userRepository.setCurrentActiveSchoolId(user.id, school.id, session);

      await session.commitTransaction();
      session.endSession();

      const accessToken = this.generateToken({ id: user.id, email: user.email, currentActiveSchoolId: school.id });
      return this.ok('User created successfully', AuthResponseDto.fromToken(accessToken));
    } catch (error: any) {
      // Fallback: if Mongo doesn't support transactions (standalone), run without session
      if (error && (error.code === 20 || error?.codeName === 'IllegalOperation' || (typeof error.message === 'string' && error.message.includes('Transaction numbers are only allowed')))) {
        try { await session.abortTransaction(); } catch {}
        try { session.endSession(); } catch {}

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userRepository.create({ ...payload, password: hashedPassword });

        const school = await this.schoolRepository.create({ name: `${payload.name}'s School`, owner: user.id, onHold: true } as any);

        /* Create membership for the user in the school */
        await this.membershipRepository.create({ userId: user.id, schoolId: school.id, role: MembershipRole.COACH });

        await this.userRepository.setCurrentActiveSchoolId(user.id, school.id);

        const accessToken = this.generateToken({ id: user.id, email: user.email, currentActiveSchoolId: school.id });
        return this.ok('User created successfully', AuthResponseDto.fromToken(accessToken));
      }

      try { await session.abortTransaction(); } catch {}
      try { session.endSession(); } catch {}
      throw error;
    }
  }

  private generateToken(payload: { id: string; email: string; currentActiveSchoolId?: string }): string {
    return this.jwtService.sign(payload);
  }
}
