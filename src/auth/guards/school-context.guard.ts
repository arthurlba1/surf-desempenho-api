import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IMembershipRepositoryPort } from '@/school/domain/ports/membership.repository.port';
import { MembershipStatus } from '@/school/schemas/membership.schema';
import type { AuthUser } from '@/common/types/auth.types';

export const REQUIRE_SCHOOL_CONTEXT_KEY = 'requireSchoolContext';
export const REQUIRE_SCHOOL_ROLES_KEY = 'requireSchoolRoles';

@Injectable()
export class SchoolContextGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private membershipRepository: IMembershipRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const requireSchoolContext = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_SCHOOL_CONTEXT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireSchoolContext) {
      return true; // No school context required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const schoolId = user.currentActiveSchoolId;

    if (!schoolId) {
      throw new BadRequestException('currentActiveSchoolId is required for this operation');
    }

    const membership = await this.membershipRepository.findByUserIdAndSchoolId(
      user.id,
      schoolId,
    );

    if (!membership) {
      throw new ForbiddenException('You do not have access to this school');
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException(
        `Your membership is ${membership.status}. Only ACTIVE members can access school operations`,
      );
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_SCHOOL_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(membership.role);
      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `This operation requires one of the following roles: ${requiredRoles.join(', ')}. Your role: ${membership.role}`,
        );
      }
    }

    request.schoolMembership = membership;

    return true;
  }
}
