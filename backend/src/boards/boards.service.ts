import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema.js';
import { BoardMember, BoardMemberDocument, BoardRole} from './schemas/board-member.schema.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(BoardMember.name)
    private boardMemberModel: Model<BoardMemberDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateBoardDto) {
    const board = new this.boardModel({
        ownerId: new Types.ObjectId(userId),
        title: dto.title,
        description: dto.description ?? '',
    });

    await board.save();

    await this.boardMemberModel.create({
        boardId: board._id,
        userId: new Types.ObjectId(userId),
        role: BoardRole.OWNER,
    });

    return board;
    }

  async findAllForUser(userId: string) {
    const memberships = await this.boardMemberModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('boardId')
      .exec();

    return memberships
      .filter((m) => m.boardId)
      .map((m) => ({
        ...(m.boardId as any).toObject(),
        role: m.role,
      }));
  }

  async findOne(boardId: string, userId: string) {
    const membership = await this.ensureMembership(boardId, userId);

    const board = await this.boardModel.findById(boardId).exec();
    if (!board) throw new NotFoundException('Board not found');

    return {
      ...(board as any).toObject(),
      role: membership.role,
    };
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    await this.ensureRole(boardId, userId, [BoardRole.OWNER]);

    const board = await this.boardModel
      .findByIdAndUpdate(boardId, dto, { new: true })
      .exec();

    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async remove(boardId: string, userId: string) {
    await this.ensureRole(boardId, userId, [BoardRole.OWNER]);

    await this.boardMemberModel.deleteMany({ boardId }).exec();
    await this.boardModel.findByIdAndDelete(boardId).exec();

    return { message: 'Board deleted successfully' };
  }

  async inviteMember(
    boardId: string,
    currentUserId: string,
    email: string,
    role: BoardRole,
  ) {
    await this.ensureRole(boardId, currentUserId, [BoardRole.OWNER]);

    if (role === BoardRole.OWNER) {
      throw new BadRequestException('Cannot invite someone as Owner');
    }

    const userToInvite = await this.usersService.findByEmail(email);
    if (!userToInvite) {
      throw new NotFoundException('User with this email not found');
    }

    const existing = await this.boardMemberModel.findOne({
      boardId,
      userId: userToInvite._id,
    });

    if (existing) {
      throw new ConflictException('User is already a member of this board');
    }

    const member = await this.boardMemberModel.create({
      boardId: new Types.ObjectId(boardId),
      userId: userToInvite._id,
      role,
    });

    return member;
  }

  async ensureMembership(boardId: string, userId: string) {
    const membership = await this.boardMemberModel.findOne({
      boardId: new Types.ObjectId(boardId),
      userId: new Types.ObjectId(userId),
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }

    return membership;
  }

  async ensureRole(
    boardId: string,
    userId: string,
    allowedRoles: BoardRole[],
  ) {
    const membership = await this.ensureMembership(boardId, userId);

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return membership;
  }
}