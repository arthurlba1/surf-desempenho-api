import { ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import { IUseCaseResponse } from '@/common/types/use-case-response';
import { RegisterCommand } from '@/auth/application/commands/register.command';
import { AuthResponse } from '@/auth/application/responses/auth.response';
import { CreateUserUseCase } from '@/identity/application/commands/create-user.use-case';
import { CreateUserCommand } from '@/identity/application/commands/create-user.command';
import { CreateSchoolUseCase } from '@/school/application/commands/create-school.use-case';
import { CreateSchoolCommand } from '@/school/application/commands/create-school.command';
import { CreateMembershipUseCase } from '@/school/application/commands/create-membership.use-case';
import { CreateMembershipCommand } from '@/school/application/commands/create-membership.command';
import { IUserRepositoryPort } from '@/identity/domain/ports/user.repository.port';
import { MembershipRole, MembershipStatus } from '@/school/schemas/membership.schema';

@Injectable()
export class RegisterCoachUseCase extends BaseUseCase<RegisterCommand, AuthResponse> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createSchoolUseCase: CreateSchoolUseCase,
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly userRepository: IUserRepositoryPort,
    @InjectConnection() private readonly connection: Connection,
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

    

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const userResult = await this.createUserUseCase.handle(createUserCommand);
      const user = userResult.detail;
      if (!user) throw new Error('User not created');

      const createSchoolCommand: CreateSchoolCommand = {
        name: `${payload.name}'s School`,
        ownerId: user.id,
      };
      const schoolResult = await this.createSchoolUseCase.handle(createSchoolCommand);
      const school = schoolResult.detail!;

      const createMembershipCommand: CreateMembershipCommand = {
        userId: user.id,
        schoolId: school.id,
        role: MembershipRole.HEADCOACH,
        status: MembershipStatus.ACTIVE,
      };
      await this.createMembershipUseCase.handle(createMembershipCommand);

      await this.userRepository.setCurrentActiveSchoolId(user.id, school.id);

      await session.commitTransaction();
      session.endSession();

      const accessToken = this.generateToken({
        id: user.id,
        email: user.email,
        currentActiveSchoolId: school.id,
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
        currentActiveSchoolId: school.id,
        schools: [{
          id: school.id,
          name: school.name,
          role: 'HEADCOACH',
          status: 'ACTIVE',
        }],
      };

      return this.ok('User created successfully', AuthResponse.from(accessToken, userResponse));
    } catch (error: any) {
      // Fallback: if Mongo doesn't support transactions (standalone), run without session
      if (
        error &&
        (error.code === 20 ||
          error?.codeName === 'IllegalOperation' ||
          (typeof error.message === 'string' &&
            error.message.includes('Transaction numbers are only allowed')))
      ) {
        try {
          await session.abortTransaction();
        } catch {}
        try {
          session.endSession();
        } catch {}

        const userResult = await this.createUserUseCase.handle(createUserCommand);
        const user = userResult.detail;
        if (!user) throw new Error('User not created');

        const createSchoolCommand: CreateSchoolCommand = {
          name: `${payload.name}'s School`,
          ownerId: user.id,
        };
        const schoolResult = await this.createSchoolUseCase.handle(createSchoolCommand);
        const school = schoolResult.detail!;

        const createMembershipCommand: CreateMembershipCommand = {
          userId: user.id,
          schoolId: school.id,
          role: MembershipRole.HEADCOACH,
          status: MembershipStatus.ACTIVE,
        };
        await this.createMembershipUseCase.handle(createMembershipCommand);

        await this.userRepository.setCurrentActiveSchoolId(user.id, school.id);

        const accessToken = this.generateToken({
          id: user.id,
          email: user.email,
          currentActiveSchoolId: school.id,
        });

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePictureUrl: user.profilePictureUrl,
          birthdate: user.birthdate,
          document: user.document,
          currentActiveSchoolId: school.id,
          schools: [{
            id: school.id,
            name: school.name,
            role: 'HEADCOACH',
            status: 'ACTIVE',
          }],
        };

        return this.ok('User created successfully', AuthResponse.from(accessToken, userResponse));
      }

      try {
        await session.abortTransaction();
      } catch {}
      try {
        session.endSession();
      } catch {}
      throw error;
    }
  }

  private generateToken(payload: { id: string; email: string; currentActiveSchoolId?: string }): string {
    return this.jwtService.sign(payload);
  }
}
