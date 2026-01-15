import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMyFinCommand {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() set?: string;
  @IsOptional() @IsNumber() size?: number;
  @IsOptional() @IsNumber() area?: number;
  @IsOptional() @IsNumber() rake?: number;
  @IsOptional() @IsNumber() base?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsString() foil?: string;
  @IsOptional() @IsString() material?: string;
  @IsOptional() @IsString() system?: string;
}
