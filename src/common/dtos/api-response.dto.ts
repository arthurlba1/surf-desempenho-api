import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDto<T> {
  @ApiProperty({ type: Object })
  detail?: T;

  @ApiProperty({ type: [String], oneOf: [
    { type: 'string' },
    { type: 'array', items: { type: 'string' } }
  ]})
  message: string | string[];
}
