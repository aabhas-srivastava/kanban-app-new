import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema.js';
import { BoardsService } from '../boards/boards.service.js';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private boardsService: BoardsService,
  ) {}

  async log(params: {
    boardId: string;
    userId: string;
    action: string;
    cardId?: string | null;
    meta?: Record<string, any>;
  }) {
    const activity = await this.activityModel.create({
      boardId: new Types.ObjectId(params.boardId),
      userId: new Types.ObjectId(params.userId),
      cardId: params.cardId ? new Types.ObjectId(params.cardId) : null,
      action: params.action,
      meta: params.meta || {},
    });

    return activity;
  }

  async findByBoard(boardId: string, userId: string) {
    await this.boardsService.ensureMembership(boardId, userId);

    return this.activityModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('cardId', 'title')
      .limit(50)
      .exec();
  }

  async findByCard(cardId: string, userId: string) {
    return this.activityModel
      .find({ cardId: new Types.ObjectId(cardId) })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .limit(30)
      .exec();
  }
}