import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import type { AuthUser } from '@/common/types/auth.types';
import { BaseUseCase } from '@/common/use-cases/use-case-handle';
import type { IUseCaseResponse } from '@/common/types/use-case-response';
import { ISchoolRepositoryPort } from '@/school/domain/ports/school.repository.port';
import { SchoolInviteLinkResponse } from '@/school/application/responses/school-invite-link.response';
import { GetSchoolInviteLinkQuery } from './get-school-invite-link.query';

@Injectable()
export class GetSchoolInviteLinkUseCase extends BaseUseCase<
  GetSchoolInviteLinkQuery,
  SchoolInviteLinkResponse
> {
  constructor(
    private readonly schoolRepository: ISchoolRepositoryPort,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async handle(
    _payload: GetSchoolInviteLinkQuery,
    auth?: AuthUser,
  ): Promise<IUseCaseResponse<SchoolInviteLinkResponse>> {
    if (!auth) throw new UnauthorizedException('User not authenticated');

    const schoolId = auth.currentActiveSchoolId;
    if (!schoolId) {
      throw new BadRequestException('currentActiveSchoolId is required for this operation');
    }

    let school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    school = (await this.schoolRepository.ensureTempJoinCodeIfMissing(schoolId)) ?? school;

    const token = school.inviteToken || '';
    if (!token) {
      throw new NotFoundException('School invite token not found');
    }

    const scheme = this.configService.get<string>('INVITE_APP_SCHEME', 'surfdesempenhoapp');
    const url = `${scheme}://invite?token=${token}`;

    return this.ok(
      'Invite link fetched successfully',
      SchoolInviteLinkResponse.from(token, url, school.tempJoinCode),
    );
  }
}
