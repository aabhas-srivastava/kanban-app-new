import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';
import { Comment, CommentSchema } from './schemas/comment.schema.js';
import { CardsModule } from '../cards/cards.module.js';
import { BoardsModule } from '../boards/boards.module.js';
import { ActivityModule } from '../activity/activity.module.js';

@Module({

  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema }]),
    CardsModule,
    BoardsModule,
    ActivityModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],

})

export class CommentsModule {}