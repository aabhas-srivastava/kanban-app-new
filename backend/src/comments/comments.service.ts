import { Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CardsService } from '../cards/cards.service.js';
import { BoardsService } from '../boards/boards.service.js';
import { BoardRole } from '../boards/schemas/board-member.schema.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private cardsService: CardsService,
    private boardsService: BoardsService,
  ) {}

  async create(cardId: string, userId: string, dto: CreateCommentDto) {

    const comment = await this.commentModel.create({
      cardId: new Types.ObjectId(cardId),
      userId: new Types.ObjectId(userId),
      text: dto.text,
    });

    return comment.populate('userId', 'name email');
  }

  async findByCard(cardId: string, userId: string) {
    return this.commentModel
      .find({ cardId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .exec();
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await comment.deleteOne();
    return { message: 'Comment deleted successfully' };
    
  }
}