import { Controller, Get, Param } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { type AuthUser } from '@/common/types/auth.types';
import { ListSchoolMembersResponseDto } from '@/common/dtos/list-school-members-response.dto';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { ListSchoolMembersDto } from '@/school/dtos/list-school-members.dto';
import { ListSchoolMembersUseCase } from '@/school/use-cases/list-school-members';

@Controller('school')
export class SchoolController {
  constructor(
    private readonly listSchoolMembersUseCase: ListSchoolMembersUseCase,
  ) {}

  @Get('/:schoolId/members')
  async listSchoolMembers(@CurrentUser() authUser: AuthUser, @Param('schoolId') schoolId: string): Promise<ApiResponseDto<ListSchoolMembersResponseDto[]>> {
    return await this.listSchoolMembersUseCase.handle({ schoolId } as ListSchoolMembersDto, authUser);
  }
}
