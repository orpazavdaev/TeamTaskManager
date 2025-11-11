import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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

  async searchPublicProjects(searchTerm?: string) {
    const query: any = { isPublic: true };
    if (searchTerm && searchTerm.trim()) {
      // Escape special regex characters
      const escapedTerm = searchTerm
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escapedTerm, $options: "i" } },
        { description: { $regex: escapedTerm, $options: "i" } },
      ];
    }
    const projects = await this.projectModel
      .find(query)
      .populate("ownerId", "name email")
      .populate("boards", "name color")
      .populate("activeBoardId", "name color")
      .limit(50);
    return projects;
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

      // Ensure only one board is active per project - clear activeBoardId from other projects
      await this.projectModel.updateMany(
        {
          _id: { $ne: id },
          activeBoardId: updateProjectDto.activeBoardId,
        },
        { $set: { activeBoardId: null } }
      );
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

  async updateAllProjectColors() {
    // Update all projects with old colors to new blue color
    const result = await this.projectModel.updateMany(
      {
        color: {
          $in: [
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
            "#d782ba",
            "#e18ad4",
            "#eeb1d5",
            "#efc7e5",
          ],
        },
      },
      { $set: { color: "#2A6F97" } }
    );
    return {
      message: `Updated ${result.modifiedCount} projects to new color scheme`,
      modifiedCount: result.modifiedCount,
    };
  }

  async addMemberToProject(
    projectId: string,
    userId: string,
    currentUserId: string
  ) {
    const project = await this.findOne(projectId, currentUserId);

    // Only owner can add members
    if (project.ownerId.toString() !== currentUserId) {
      throw new ForbiddenException("Only the project owner can add members");
    }

    // Check if user is already a member
    if (project.members.some((memberId) => memberId.toString() === userId)) {
      throw new BadRequestException("User is already a member of this project");
    }

    // Check if user is the owner
    if (project.ownerId.toString() === userId) {
      throw new BadRequestException(
        "User is already the owner of this project"
      );
    }

    // Add user to members
    project.members.push(userId as any);
    await project.save();

    const updatedProject = await this.findOne(projectId, currentUserId);
    this.appGateway.broadcastProjectUpdate(updatedProject, "update");
    return updatedProject;
  }

  async removeMemberFromProject(
    projectId: string,
    userId: string,
    currentUserId: string
  ) {
    const project = await this.findOne(projectId, currentUserId);

    // Only owner can remove members
    if (project.ownerId.toString() !== currentUserId) {
      throw new ForbiddenException("Only the project owner can remove members");
    }

    // Cannot remove owner
    if (project.ownerId.toString() === userId) {
      throw new BadRequestException("Cannot remove the project owner");
    }

    // Remove user from members
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userId
    ) as any;
    await project.save();

    const updatedProject = await this.findOne(projectId, currentUserId);
    this.appGateway.broadcastProjectUpdate(updatedProject, "update");
    return updatedProject;
  }
}
