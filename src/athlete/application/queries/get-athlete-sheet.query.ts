import { IsNotEmpty, IsString } from 'class-validator';

export class GetAthleteSheetQuery {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
