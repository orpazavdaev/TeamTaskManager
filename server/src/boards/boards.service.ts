import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Board, BoardDocument } from "./schemas/board.schema";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { AppGateway } from "../app.gateway";

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @Inject(forwardRef(() => AppGateway))
    private appGateway: AppGateway
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string) {
    const board = new this.boardModel({
      ...createBoardDto,
      ownerId: userId,
      members: createBoardDto.members || [],
    });
    const savedBoard = await board.save();
    this.appGateway.broadcastBoardUpdate(savedBoard, "create");
    return savedBoard;
  }

  async findAll(userId: string) {
    return this.boardModel
      .find({
        $or: [{ ownerId: userId }, { members: userId }],
      })
      .populate("ownerId", "name email")
      .populate("members", "name email");
  }

  async findOne(id: string, userId: string) {
    const board = await this.boardModel
      .findOne({
        _id: id,
        $or: [{ ownerId: userId }, { members: userId }],
      })
      .populate("ownerId", "name email")
      .populate("members", "name email");

    if (!board) {
      throw new NotFoundException("Board not found");
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    const board = await this.boardModel.findById(id);
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const isOwner = board.ownerId.toString() === userId;
    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new ForbiddenException(
        "You do not have permission to update this board"
      );
    }

    Object.assign(board, updateBoardDto);
    const updatedBoard = await board.save();
    this.appGateway.broadcastBoardUpdate(updatedBoard, "update");
    return updatedBoard;
  }

  async remove(id: string, userId: string) {
    const board = await this.boardModel.findById(id);
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    if (board.ownerId.toString() !== userId) {
      throw new ForbiddenException("Only the owner can delete this board");
    }

    await this.boardModel.findByIdAndDelete(id);
    this.appGateway.broadcastBoardUpdate(board, "delete");
    return { message: "Board deleted successfully" };
  }
}
