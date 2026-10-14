import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardsService } from './boards.service.js';
import { BoardsController } from './boards.controller.js';
import { Board, BoardSchema } from './schemas/board.schema.js';
import { BoardMember, BoardMemberSchema } from './schemas/board-member.schema.js';
import { UsersModule } from '../users/users.module.js';


@Module({

  imports : [
    MongooseModule.forFeature([
      {name : Board.name, schema : BoardSchema},
      {name : BoardMember.name, schema : BoardMemberSchema},
    ]),
    UsersModule,
  ],

  providers: [BoardsService],
  controllers: [BoardsController],
  exports : [BoardsService],
})
export class BoardsModule {}
