import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ActivityService } from './activity.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('boards/:boardId/activity')
  findByBoard(
    @Param('boardId') boardId: string,
    @Request() req: any,
  ) {
    return this.activityService.findByBoard(boardId, req.user.userId);
  }

  @Get('cards/:cardId/activity')
  findByCard(
    @Param('cardId') cardId: string,
    @Request() req: any,
  ) {
    return this.activityService.findByCard(cardId, req.user.userId);
  }
}