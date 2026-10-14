import { IsOptional, IsString, IsDateString, IsArray, IsBoolean } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsArray()
  @IsOptional()
  assignees?: string[];

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}