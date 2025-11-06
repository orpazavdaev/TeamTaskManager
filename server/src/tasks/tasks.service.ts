import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Task, TaskDocument, TaskStatus } from "./schemas/task.schema";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskDto } from "./dto/move-task.dto";
import { AppGateway } from "../app.gateway";
import { BoardsService } from "../boards/boards.service";

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private appGateway: AppGateway,
    @Inject(forwardRef(() => BoardsService))
    private boardsService: BoardsService
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    // Verify user has access to board
    await this.boardsService.findOne(createTaskDto.boardId, userId);

    const task = new this.taskModel({
      ...createTaskDto,
      createdBy: userId,
      status: createTaskDto.status || TaskStatus.TODO,
    });
    const savedTask = await task.save();
    const populatedTask = await this.taskModel
      .findById(savedTask._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .lean();

    const serializedTask = {
      ...populatedTask,
      _id: populatedTask._id.toString(),
      boardId: populatedTask.boardId.toString(),
      createdBy: populatedTask.createdBy
        ? {
            _id:
              (populatedTask.createdBy as any)._id?.toString() ||
              (populatedTask.createdBy as any).id,
            name: (populatedTask.createdBy as any).name,
            email: (populatedTask.createdBy as any).email,
          }
        : populatedTask.createdBy,
      assignedTo: (populatedTask.assignedTo || []).map((assignee: any) => ({
        _id: assignee._id?.toString() || assignee.id,
        name: assignee.name,
        email: assignee.email,
      })),
    };

    this.appGateway.broadcastTaskUpdate(
      createTaskDto.boardId,
      serializedTask,
      "create"
    );
    return serializedTask;
  }

  async findAll(boardId: string, userId: string) {
    // Verify user has access to board
    await this.boardsService.findOne(boardId, userId);

    const tasks = await this.taskModel
      .find({ boardId })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Convert to plain objects to ensure proper serialization
    return tasks.map((task) => ({
      ...task,
      _id: task._id.toString(),
      boardId: task.boardId.toString(),
      createdBy: task.createdBy
        ? {
            _id:
              (task.createdBy as any)._id?.toString() ||
              (task.createdBy as any).id,
            name: (task.createdBy as any).name,
            email: (task.createdBy as any).email,
          }
        : task.createdBy,
      assignedTo: (task.assignedTo || [])
        .filter((assignee: any) => assignee && typeof assignee === "object")
        .map((assignee: any) => ({
          _id: assignee._id?.toString() || assignee.id,
          name: assignee.name || "",
          email: assignee.email || "",
        })),
    }));
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskModel
      .findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .lean();
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Verify user has access to board
    await this.boardsService.findOne(task.boardId.toString(), userId);

    // Convert to plain object
    return {
      ...task,
      _id: task._id.toString(),
      boardId: task.boardId.toString(),
      createdBy: task.createdBy
        ? {
            _id:
              (task.createdBy as any)._id?.toString() ||
              (task.createdBy as any).id,
            name: (task.createdBy as any).name,
            email: (task.createdBy as any).email,
          }
        : task.createdBy,
      assignedTo: (task.assignedTo || [])
        .filter((assignee: any) => assignee && typeof assignee === "object")
        .map((assignee: any) => ({
          _id: assignee._id?.toString() || assignee.id,
          name: assignee.name || "",
          email: assignee.email || "",
        })),
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Verify user has access to board
    await this.boardsService.findOne(task.boardId.toString(), userId);

    Object.assign(task, updateTaskDto);
    const updatedTask = await task.save();
    const populatedTask = await this.taskModel
      .findById(updatedTask._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .lean();

    const serializedTask = {
      ...populatedTask,
      _id: populatedTask._id.toString(),
      boardId: populatedTask.boardId.toString(),
      createdBy: populatedTask.createdBy
        ? {
            _id:
              (populatedTask.createdBy as any)._id?.toString() ||
              (populatedTask.createdBy as any).id,
            name: (populatedTask.createdBy as any).name,
            email: (populatedTask.createdBy as any).email,
          }
        : populatedTask.createdBy,
      assignedTo: (populatedTask.assignedTo || []).map((assignee: any) => ({
        _id: assignee._id?.toString() || assignee.id,
        name: assignee.name,
        email: assignee.email,
      })),
    };

    this.appGateway.broadcastTaskUpdate(
      task.boardId.toString(),
      serializedTask,
      "update"
    );
    return serializedTask;
  }

  async move(id: string, moveTaskDto: MoveTaskDto, userId: string) {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Verify user has access to board
    await this.boardsService.findOne(task.boardId.toString(), userId);

    task.status = moveTaskDto.status;
    task.order = moveTaskDto.order;
    const movedTask = await task.save();
    const populatedTask = await this.taskModel
      .findById(movedTask._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .lean();

    const serializedTask = {
      ...populatedTask,
      _id: populatedTask._id.toString(),
      boardId: populatedTask.boardId.toString(),
      createdBy: populatedTask.createdBy
        ? {
            _id:
              (populatedTask.createdBy as any)._id?.toString() ||
              (populatedTask.createdBy as any).id,
            name: (populatedTask.createdBy as any).name,
            email: (populatedTask.createdBy as any).email,
          }
        : populatedTask.createdBy,
      assignedTo: (populatedTask.assignedTo || []).map((assignee: any) => ({
        _id: assignee._id?.toString() || assignee.id,
        name: assignee.name,
        email: assignee.email,
      })),
    };

    this.appGateway.broadcastTaskUpdate(
      task.boardId.toString(),
      serializedTask,
      "update"
    );
    return serializedTask;
  }

  async remove(id: string, userId: string) {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Verify user has access to board
    await this.boardsService.findOne(task.boardId.toString(), userId);

    await this.taskModel.findByIdAndDelete(id);
    this.appGateway.broadcastTaskUpdate(
      task.boardId.toString(),
      task,
      "delete"
    );
    return { message: "Task deleted successfully" };
  }
}
