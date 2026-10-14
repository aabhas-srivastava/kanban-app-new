import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request} from '@nestjs/common';
import { CardsService } from './cards.service.js';
import { CreateCardDto } from './dto/create-card.dto.js';
import { UpdateCardDto } from './dto/update-card.dto.js';
import { MoveCardDto } from './dto/move-card.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';


@Controller()
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('columns/:columnId/cards')
  create(
    @Param('columnId') columnId: string,
    @Request() req: any,
    @Body() dto: CreateCardDto,
  ) {
    return this.cardsService.create(columnId, req.user.userId, dto);
  }

  @Get('columns/:columnId/cards')
  findByColumn(
    @Param('columnId') columnId: string,
    @Request() req: any,
  ) {
    return this.cardsService.findByColumn(columnId, req.user.userId);
  }

  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, req.user.userId, dto);
  }

  @Patch('cards/:id/move')
  move(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: MoveCardDto,
  ) {
    return this.cardsService.move(id, req.user.userId, dto);
  }

  @Delete('cards/:id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.remove(id, req.user.userId);
  }
}