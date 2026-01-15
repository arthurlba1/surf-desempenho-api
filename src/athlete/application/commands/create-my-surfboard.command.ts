import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMySurfboardCommand {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsNumber() size?: number;
  @IsOptional() @IsNumber() width?: number;
  @IsOptional() @IsString() fractionalInches?: string;
  @IsOptional() @IsNumber() thickness?: number;
  @IsOptional() @IsNumber() volume?: number;
  @IsOptional() @IsString() tail?: string;
}
