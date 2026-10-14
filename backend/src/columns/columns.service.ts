import { Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Column, ColumnDocument } from './schemas/column.schema.js';
import { BoardsService } from '../boards/boards.service.js';
import { BoardRole } from '../boards/schemas/board-member.schema.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    private boardsService: BoardsService,
  ) {}

  async create(boardId: string, userId: string, dto: CreateColumnDto) {

    await this.boardsService.ensureRole(boardId, userId, [
      BoardRole.OWNER,
      BoardRole.MEMBER,
    ]);

    const lastColumn = await this.columnModel
      .findOne({ boardId })
      .sort({ position: -1 })
      .exec();

    const newPosition = lastColumn ? lastColumn.position + 1 : 0;

    const column = await this.columnModel.create({
      boardId: new Types.ObjectId(boardId),
      title: dto.title,
      position: newPosition,
    });

    return column;
  }

  async findAllByBoard(boardId: string, userId: string) {
    await this.boardsService.ensureMembership(boardId, userId);

    return this.columnModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ position: 1 })
      .exec();
  }

  async update(
    columnId: string,
    userId: string,
    dto: UpdateColumnDto,
  ) {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) throw new NotFoundException('Column not found');

    await this.boardsService.ensureRole(
      column.boardId.toString(),
      userId,
      [BoardRole.OWNER, BoardRole.MEMBER],
    );

    Object.assign(column, dto);
    return column.save();
  }

  async remove(columnId: string, userId: string) {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) throw new NotFoundException('Column not found');

    await this.boardsService.ensureRole(
      column.boardId.toString(),
      userId,
      [BoardRole.OWNER, BoardRole.MEMBER],
    );

    await column.deleteOne();
    return { message: 'Column deleted successfully' };
    
  }
}