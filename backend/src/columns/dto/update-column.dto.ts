import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}