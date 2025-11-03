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
    this.appGateway.broadcastTaskUpdate(
      createTaskDto.boardId,
      savedTask,
      "create"
    );
    return savedTask;
  }

  async findAll(boardId: string, userId: string) {
    // Verify user has access to board
    await this.boardsService.findOne(boardId, userId);

    return this.taskModel
      .find({ boardId })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ order: 1, createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskModel
      .findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Verify user has access to board
    await this.boardsService.findOne(task.boardId.toString(), userId);
    return task;
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
    this.appGateway.broadcastTaskUpdate(
      task.boardId.toString(),
      updatedTask,
      "update"
    );
    return updatedTask;
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
    this.appGateway.broadcastTaskUpdate(
      task.boardId.toString(),
      movedTask,
      "update"
    );
    return movedTask;
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
