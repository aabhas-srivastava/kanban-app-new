import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request} from '@nestjs/common';
import { ColumnsService } from './columns.service.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
@Controller()
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post('boards/:boardId/columns')
  create(
    @Param('boardId') boardId: string,
    @Request() req: any,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(boardId, req.user.userId, dto);
  }

  @Get('boards/:boardId/columns')
  findAll(@Param('boardId') boardId: string, @Request() req: any) {
    return this.columnsService.findAllByBoard(boardId, req.user.userId);
  }

  @Patch('columns/:id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, req.user.userId, dto);
  }

  @Delete('columns/:id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.columnsService.remove(id, req.user.userId);
  }
}