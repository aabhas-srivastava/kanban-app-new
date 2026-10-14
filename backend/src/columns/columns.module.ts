import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColumnsService } from './columns.service.js';
import { ColumnsController } from './columns.controller.js';
import { Column, ColumnSchema } from './schemas/column.schema.js';
import { BoardsModule } from '../boards/boards.module.js';

@Module({

  imports : [
    MongooseModule.forFeature([{ name : Column.name, schema : ColumnSchema}]),
    BoardsModule,
  ],
  providers: [ColumnsService],
  controllers: [ColumnsController],
  exports: [ColumnsService]
  
})
export class ColumnsModule {}
