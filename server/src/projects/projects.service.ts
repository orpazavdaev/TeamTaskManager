import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Project, ProjectDocument } from "./schemas/project.schema";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { AppGateway } from "../app.gateway";
import { Board, BoardDocument } from "../boards/schemas/board.schema";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @Inject(forwardRef(() => AppGateway))
    private appGateway: AppGateway
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = new this.projectModel({
      ...createProjectDto,
      ownerId: userId,
      members: createProjectDto.members || [],
    });
    const savedProject = await project.save();
    this.appGateway.broadcastProjectUpdate(savedProject, "create");
    return savedProject;
  }

  async findMyProjects(userId: string) {
    // Projects created by the user
    return this.projectModel
      .find({ ownerId: userId })
      .populate("ownerId", "name email")
      .populate("members", "name email")
      .populate("boards", "name color")
      .populate("activeBoardId", "name color");
  }

  async findSharedProjects(userId: string) {
    // Projects where user is a member (but not owner)
    return this.projectModel
      .find({
        members: userId,
        ownerId: { $ne: userId },
      })
      .populate("ownerId", "name email")
      .populate("members", "name email")
      .populate("boards", "name color")
      .populate("activeBoardId", "name color");
  }

  async findAll(userId: string) {
    return this.projectModel
      .find({
        $or: [{ ownerId: userId }, { members: userId }],
      })
      .populate("ownerId", "name email")
      .populate("members", "name email")
      .populate("boards", "name color")
      .populate("activeBoardId", "name color");
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectModel
      .findOne({
        _id: id,
        $or: [{ ownerId: userId }, { members: userId }],
      })
      .populate("ownerId", "name email")
      .populate("members", "name email")
      .populate("boards", "name color")
      .populate("activeBoardId", "name color");

    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const isOwner = project.ownerId.toString() === userId;
    const isMember = project.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new ForbiddenException(
        "You do not have permission to update this project"
      );
    }

    // If updating activeBoardId, verify the board belongs to this project
    if (updateProjectDto.activeBoardId) {
      const board = await this.boardModel.findById(
        updateProjectDto.activeBoardId
      );
      if (!board || board.projectId?.toString() !== id) {
        throw new ForbiddenException("The board must belong to this project");
      }
    }

    Object.assign(project, updateProjectDto);
    const updatedProject = await project.save();
    this.appGateway.broadcastProjectUpdate(updatedProject, "update");
    return updatedProject;
  }

  async remove(id: string, userId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (project.ownerId.toString() !== userId) {
      throw new ForbiddenException("Only the owner can delete this project");
    }

    // Remove projectId from all boards in this project
    await this.boardModel.updateMany(
      { projectId: id },
      { $set: { projectId: null } }
    );

    await this.projectModel.findByIdAndDelete(id);
    this.appGateway.broadcastProjectUpdate(project, "delete");
    return { message: "Project deleted successfully" };
  }

  async addBoardToProject(projectId: string, boardId: string, userId: string) {
    const project = await this.findOne(projectId, userId);
    const board = await this.boardModel.findById(boardId);

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    // Verify user has access to the board
    const isOwner = board.ownerId.toString() === userId;
    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId
    );
    if (!isOwner && !isMember) {
      throw new ForbiddenException("You do not have access to this board");
    }

    // Add board to project
    if (!project.boards.includes(boardId as any)) {
      project.boards.push(boardId as any);
      await project.save();
    }

    // Set board's projectId
    board.projectId = projectId as any;
    await board.save();

    const updatedProject = await this.findOne(projectId, userId);
    this.appGateway.broadcastProjectUpdate(updatedProject, "update");
    return updatedProject;
  }

  async removeBoardFromProject(
    projectId: string,
    boardId: string,
    userId: string
  ) {
    const project = await this.findOne(projectId, userId);
    const board = await this.boardModel.findById(boardId);

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    // Remove board from project
    project.boards = project.boards.filter(
      (b) => b.toString() !== boardId
    ) as any;

    // If this was the active board, clear it
    if (project.activeBoardId?.toString() === boardId) {
      project.activeBoardId = null;
    }

    await project.save();

    // Remove projectId from board
    board.projectId = null;
    await board.save();

    const updatedProject = await this.findOne(projectId, userId);
    this.appGateway.broadcastProjectUpdate(updatedProject, "update");
    return updatedProject;
  }
}
