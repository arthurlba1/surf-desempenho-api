import type { AuthUser } from '@/common/types/auth.types';

export interface RequestWithUser extends Request {
  user: AuthUser;
}

