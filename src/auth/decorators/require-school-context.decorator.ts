import { applyDecorators, SetMetadata } from '@nestjs/common';
import { REQUIRE_SCHOOL_CONTEXT_KEY } from '@/auth/guards/school-context.guard';

/**
 * Decorator to require school context authorization
 * Validates that user has ACTIVE membership in the school defined by JWT context (currentActiveSchoolId)
 * 
 * Usage:
 * @RequireSchoolContext()
 * @Get('schools/members')
 * async listMembers() { ... }
 */
export const RequireSchoolContext = () => applyDecorators(SetMetadata(REQUIRE_SCHOOL_CONTEXT_KEY, true));
