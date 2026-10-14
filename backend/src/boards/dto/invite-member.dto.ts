import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { BoardRole } from '../schemas/board-member.schema.js';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(BoardRole)
  role: BoardRole;
}