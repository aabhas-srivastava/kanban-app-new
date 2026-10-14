import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request} from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('cards/:cardId/comments')
  create(
    @Param('cardId') cardId: string,
    @Request() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(cardId, req.user.userId, dto);
  }

  @Get('cards/:cardId/comments')
  findByCard(@Param('cardId') cardId: string, @Request() req: any) {
    return this.commentsService.findByCard(cardId, req.user.userId);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.remove(id, req.user.userId);
  }
}