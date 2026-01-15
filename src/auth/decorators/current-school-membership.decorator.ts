import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get the current school membership from request
 * Only available after SchoolContextGuard has validated access
 * 
 * Usage:
 * @RequireSchoolContext()
 * @Get('schools/:schoolId/data')
 * async getData(@CurrentSchoolMembership() membership: Membership) {
 *   console.log('User role in this school:', membership.role);
 * }
 */
export const CurrentSchoolMembership = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.schoolMembership;
  },
);

