import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithUser } from '@/auth/types/request.types';
import type { AuthUser } from '@/common/types/auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
