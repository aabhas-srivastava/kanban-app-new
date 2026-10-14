import { IsArray, IsMongoId } from 'class-validator';

export class ReorderColumnsDto {
  @IsArray()
  @IsMongoId({ each: true })
  columnIds: string[];
}