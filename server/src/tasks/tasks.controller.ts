import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskDto } from "./dto/move-task.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  findAll(@Query("boardId") boardId: string, @Request() req) {
    return this.tasksService.findAll(boardId, req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Patch(":id/move")
  move(
    @Param("id") id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @Request() req
  ) {
    return this.tasksService.move(id, moveTaskDto, req.user.userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.userId);
  }
}

