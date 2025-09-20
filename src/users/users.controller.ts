import { Controller, Put, Body } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { UpdateUserDto } from '@/users/dtos/update-user.dto';
import { UserAuthResponseDto } from '@/auth/dtos/auth-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put()
  update(@CurrentUser() authUser: UserAuthResponseDto, @Body() createUserDto: UpdateUserDto) {
    console.log("logged user", authUser);
    return this.usersService.update(authUser, createUserDto);
  }
}
