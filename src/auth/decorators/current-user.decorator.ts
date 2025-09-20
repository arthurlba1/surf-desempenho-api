import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { RequestWithUser } from '@/auth/types/request.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
