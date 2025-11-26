import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from '@/session/dtos/create-session.dto';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}

