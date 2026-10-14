import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request} from '@nestjs/common';
import { BoardsService } from './boards.service.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.boardsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.remove(id, req.user.userId);
  }

  @Post(':id/members')
  inviteMember(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: InviteMemberDto,
  ) {
    return this.boardsService.inviteMember(
      id,
      req.user.userId,
      dto.email,
      dto.role,
    );
  }
}