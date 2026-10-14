import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardsService } from './cards.service.js';
import { CardsController } from './cards.controller.js';
import { Card, CardSchema } from './schemas/card.schema.js';
import { ColumnsModule } from '../columns/columns.module.js';
import { BoardsModule } from '../boards/boards.module.js';
import { ActivityModule } from '../activity/activity.module.js';
import { Column, ColumnSchema } from '../columns/schemas/column.schema.js';

@Module({

  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
    ColumnsModule,
    BoardsModule,
    ActivityModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})

export class CardsModule {}