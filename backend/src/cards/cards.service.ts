import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema.js';
import { BoardsService } from '../boards/boards.service.js';
import { ActivityService } from '../activity/activity.service.js';
import { CreateCardDto } from './dto/create-card.dto.js';
import { UpdateCardDto } from './dto/update-card.dto.js';
import { MoveCardDto } from './dto/move-card.dto.js';
import { Column, ColumnDocument } from '../columns/schemas/column.schema.js';
import { BoardRole } from '../boards/schemas/board-member.schema.js';


@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    private boardsService: BoardsService,
    private activityService: ActivityService,
    ) {}

    async create(columnId: string, userId: string, dto: CreateCardDto) {
        const column = await this.columnModel.findById(columnId).exec();
        if (!column) throw new NotFoundException('Column not found');

        const boardId = column.boardId.toString();

        await this.boardsService.ensureRole(boardId, userId, [
            BoardRole.OWNER,
            BoardRole.MEMBER,
        ]);

        const lastCard = await this.cardModel
            .findOne({ columnId, isArchived: false })
            .sort({ position: -1 })
            .exec();

        const newPosition = lastCard ? lastCard.position + 1 : 0;

        const card = await this.cardModel.create({
            columnId: new Types.ObjectId(columnId),
            title: dto.title,
            description: dto.description || '',
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            labels: dto.labels || [],
            position: newPosition,
            assignees: [],
        });

        await this.activityService.log({
            boardId,
            userId,
            cardId: card._id.toString(),
            action: 'created_card',
            meta: { title: card.title },
        });

        return card;
    }

    async findByColumn(columnId: string, userId: string) {
        const column = await this.columnModel.findById(columnId).exec();
        if (!column) throw new NotFoundException('Column not found');

        const boardId = column.boardId.toString();
        await this.boardsService.ensureMembership(boardId, userId);

        return this.cardModel
            .find({ columnId: new Types.ObjectId(columnId) , isArchived: false })
            .sort({ position: 1 })
            .exec();
    }

    async update(cardId: string, userId: string, dto: UpdateCardDto) {
        const card = await this.cardModel.findById(cardId).exec();
        if (!card) throw new NotFoundException('Card not found');
        if (card.isArchived) {
            throw new BadRequestException('Cannot edit an archived card');
        }

        const column = await this.columnModel.findById(card.columnId).exec();
        if (!column) throw new NotFoundException('Column not found');

        const boardId = column.boardId.toString();

        await this.boardsService.ensureRole(boardId, userId, [
            BoardRole.OWNER,
            BoardRole.MEMBER,
        ]);

        Object.assign(card, {
            ...dto,
            dueDate:
            dto.dueDate === null
                ? null
                : dto.dueDate
                ? new Date(dto.dueDate)
                : card.dueDate,
        });

        await card.save();

        await this.activityService.log({
            boardId,
            userId,
            cardId: card._id.toString(),
            action: 'updated_card',
            meta: { title: card.title },
        });

        return card;
    }

    async move(cardId: string, userId: string, dto: MoveCardDto) {
        const card = await this.cardModel.findById(cardId).exec();
        if (!card) throw new NotFoundException('Card not found');
        if (card.isArchived) {
            throw new BadRequestException('Cannot move an archived card');
        }

        const currentColumn = await this.columnModel.findById(card.columnId).exec();
        if (!currentColumn) throw new NotFoundException('Current column not found');

        const boardId = currentColumn.boardId.toString();

        await this.boardsService.ensureRole(boardId, userId, [
            BoardRole.OWNER,
            BoardRole.MEMBER,
        ]);

        const targetColumn = await this.columnModel.findById(dto.targetColumnId).exec();
        if (!targetColumn) throw new NotFoundException('Target column not found');
        if (targetColumn.boardId.toString() !== boardId) {
            throw new BadRequestException('Target column must belong to the same board');
        }

        const oldColumnId = card.columnId.toString();
        const targetColumnId = new Types.ObjectId(dto.targetColumnId);

        const cardsInTarget = await this.cardModel
            .find({
            columnId: targetColumnId,
            isArchived: false,
            _id: { $ne: card._id },
            })
            .sort({ position: 1 })
            .exec();

        let newPosition: number;

        if (dto.targetPosition === undefined || dto.targetPosition >= cardsInTarget.length) {
            newPosition =
            cardsInTarget.length > 0
                ? cardsInTarget[cardsInTarget.length - 1].position + 1
                : 0;
        } else if (dto.targetPosition <= 0) {
            newPosition = cardsInTarget.length > 0 ? cardsInTarget[0].position / 2 : 0;
        } else {
            const prev = cardsInTarget[dto.targetPosition - 1];
            const next = cardsInTarget[dto.targetPosition];
            newPosition = (prev.position + next.position) / 2;
        }

        card.columnId = targetColumnId;
        card.position = newPosition;
        await card.save();

        await this.activityService.log({
            boardId,
            userId,
            cardId: card._id.toString(),
            action: 'moved_card',
            meta: {
            fromColumnId: oldColumnId,
            toColumnId: dto.targetColumnId,
            title: card.title,
            },
        });

        return card;
    }

    async remove(cardId: string, userId: string) {
        const card = await this.cardModel.findById(cardId).exec();
        if (!card) throw new NotFoundException('Card not found');

        const column = await this.columnModel.findById(card.columnId).exec();
        if (!column) throw new NotFoundException('Column not found');

        const boardId = column.boardId.toString();

        await this.boardsService.ensureRole(boardId, userId, [
            BoardRole.OWNER,
            BoardRole.MEMBER,
        ]);

        const cardTitle = card.title;

        await card.deleteOne();

        await this.activityService.log({
            boardId,
            userId,
            cardId: cardId,
            action: 'deleted_card',
            meta: { title: cardTitle },
        });

        return { message: 'Card deleted successfully' };
    }
}