import { UserResponseDto } from '@/users/dtos/user-response.dto';

export interface RequestWithUser extends Request {
  user: UserResponseDto;
}
