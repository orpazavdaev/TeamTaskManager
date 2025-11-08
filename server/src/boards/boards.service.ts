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
import { Task, TaskDocument } from "../tasks/schemas/task.schema";

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
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

  async findMyBoards(userId: string) {
    // Boards created by the user
    return this.boardModel
      .find({ ownerId: userId })
      .populate("ownerId", "name email")
      .populate("members", "name email");
  }

  async findSharedBoards(userId: string) {
    // Get unique board IDs from tasks assigned to the user
    const tasksWithBoards = await this.taskModel
      .find({ assignedTo: userId })
      .select("boardId")
      .lean();

    const boardIdsFromTasks = tasksWithBoards.map((task) => task.boardId);

    // Get all unique board IDs (from members and from tasks)
    const allBoardIds = new Set<string>();

    // Add board IDs from tasks
    boardIdsFromTasks.forEach((boardId) => {
      allBoardIds.add(boardId.toString());
    });

    // Boards where user is a member (but not owner)
    const memberBoards = await this.boardModel
      .find({
        members: userId,
        ownerId: { $ne: userId },
      })
      .select("_id")
      .lean();

    memberBoards.forEach((board) => {
      allBoardIds.add(board._id.toString());
    });

    // Get all shared boards (not owned by user, but user has access via tasks or membership)
    const sharedBoards = await this.boardModel
      .find({
        _id: { $in: Array.from(allBoardIds) },
        ownerId: { $ne: userId },
      })
      .populate("ownerId", "name email")
      .populate("members", "name email");

    return sharedBoards;
  }

  async findOne(id: string, userId: string) {
    console.log("Finding board with ID:", id, "for user:", userId);

    // First, try to find board by direct access (owner or member)
    let board = await this.boardModel
      .findOne({
        _id: id,
        $or: [{ ownerId: userId }, { members: userId }],
      })
      .populate("ownerId", "name email")
      .populate("members", "name email")
      .populate("projectId", "name members ownerId");

    console.log("Board found by direct access:", board ? "Yes" : "No");

    // If not found, check if board belongs to a project the user is a member of
    if (!board) {
      const boardWithProject = await this.boardModel
        .findById(id)
        .populate("ownerId", "name email")
        .populate("members", "name email")
        .populate({
          path: "projectId",
          select: "name members ownerId",
          populate: [
            { path: "ownerId", select: "name email" },
            { path: "members", select: "name email" },
          ],
        });

      if (boardWithProject && boardWithProject.projectId) {
        const project = boardWithProject.projectId as any;
        const isProjectOwner = project.ownerId?.toString() === userId;
        const isProjectMember = project.members?.some(
          (member: any) =>
            member._id?.toString() === userId || member.toString() === userId
        );

        console.log("Board belongs to project:", project.name);
        console.log("User is project owner:", isProjectOwner);
        console.log("User is project member:", isProjectMember);

        if (isProjectOwner || isProjectMember) {
          board = boardWithProject;
          console.log("Board access granted through project membership");
        }
      }
    }

    if (board) {
      console.log("Board ownerId:", board.ownerId);
      console.log("Board members:", board.members);
    } else {
      // Check if board exists at all
      const boardExists = await this.boardModel.findById(id);
      console.log("Board exists in DB:", boardExists ? "Yes" : "No");
      if (boardExists) {
        console.log("Board exists but user does not have access");
        console.log("Board ownerId:", boardExists.ownerId);
        console.log("Board members:", boardExists.members);
        console.log("Board projectId:", boardExists.projectId);
      }
    }

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

  async updateAllBoardColors() {
    // Update all boards with old colors to new blue color
    const result = await this.boardModel.updateMany(
      {
        color: {
          $in: [
            "#4285F4",
            "#0052cc",
            "#0065ff",
            "#667eea",
            "#d782ba",
            "#e18ad4",
            "#eeb1d5",
            "#CDB4DB",
            "#cdb4db",
            "#FFC8DD",
            "#ffc8dd",
            "#FFAFCC",
            "#ffafcc",
            "#BDE0FE",
            "#bde0fe",
            "#A2D2FF",
            "#a2d2ff",
            "#efc7e5",
          ],
        },
      },
      { $set: { color: "#2A6F97" } }
    );
    return {
      message: `Updated ${result.modifiedCount} boards to new color scheme`,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteAllBoardsAndTasks() {
    // Delete all tasks first (to avoid orphaned references)
    const tasksResult = await this.taskModel.deleteMany({});

    // Delete all boards
    const boardsResult = await this.boardModel.deleteMany({});

    return {
      message: "All boards and tasks deleted successfully",
      deletedTasks: tasksResult.deletedCount,
      deletedBoards: boardsResult.deletedCount,
    };
  }
}
