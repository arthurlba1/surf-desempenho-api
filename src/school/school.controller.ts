import { Controller, Get, Param } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { type AuthUser } from '@/common/types/auth.types';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { ListSchoolMembersUseCase } from '@/school/use-cases/list-school-members';
import { ListMembershipsResponseDto } from '@/school/dtos/list-memberships-response.dto';

@Controller('school')
export class SchoolController {
  constructor(
    private readonly listSchoolMembersUseCase: ListSchoolMembersUseCase,
  ) {}

  @Get('/members')
  async listSchoolMembers(@CurrentUser() authUser: AuthUser): Promise<ApiResponseDto<ListMembershipsResponseDto[]>> {
    return await this.listSchoolMembersUseCase.handle(undefined, authUser);
  }
}
