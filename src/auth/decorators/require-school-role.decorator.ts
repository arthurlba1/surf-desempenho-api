import { applyDecorators, SetMetadata } from '@nestjs/common';
import { REQUIRE_SCHOOL_CONTEXT_KEY, REQUIRE_SCHOOL_ROLES_KEY } from '@/auth/guards/school-context.guard';

/**
 * Decorator to require specific roles within a school
 * Also validates school context (same as @RequireSchoolContext())
 * 
 * Usage:
 * @RequireSchoolRole('HEADCOACH')
 * @Patch('schools/:schoolId')
 * async updateSchool(@Param('schoolId') schoolId: string) { ... }
 * 
 * @RequireSchoolRole('HEADCOACH', 'COACH')
 * @Post('schools/:schoolId/training-sessions')
 * async createSession(@Param('schoolId') schoolId: string) { ... }
 */
export const RequireSchoolRole = (...roles: string[]) => {
  return applyDecorators(
    SetMetadata(REQUIRE_SCHOOL_CONTEXT_KEY, true),
    SetMetadata(REQUIRE_SCHOOL_ROLES_KEY, roles),
  );
};
