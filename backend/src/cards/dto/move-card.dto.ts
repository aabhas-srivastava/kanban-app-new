import { IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class MoveCardDto {
  @IsMongoId()
  targetColumnId: string;

  @IsNumber()
  @IsOptional()
  targetPosition?: number;
}