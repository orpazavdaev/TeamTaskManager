import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { BoardsService } from "./boards.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("boards")
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    try {
      return await this.boardsService.create(createBoardDto, req.user.userId);
    } catch (error) {
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle MongoDB connection errors
      if (
        error.name === "MongoServerError" ||
        error.message?.includes("Mongo")
      ) {
        throw new HttpException(
          "Database connection error. Please check your MongoDB connection.",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Generic error
      throw new HttpException(
        error.message || "Failed to create board. Please try again.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  findAll(@Request() req) {
    return this.boardsService.findAll(req.user.userId);
  }

  @Get("my-boards")
  findMyBoards(@Request() req) {
    return this.boardsService.findMyBoards(req.user.userId);
  }

  @Get("shared-boards")
  findSharedBoards(@Request() req) {
    return this.boardsService.findSharedBoards(req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.boardsService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req
  ) {
    return this.boardsService.update(id, updateBoardDto, req.user.userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.boardsService.remove(id, req.user.userId);
  }

  @Post("update-colors")
  @UseGuards(JwtAuthGuard)
  updateAllColors(@Request() req) {
    // Only allow admins or for now, anyone authenticated (can be restricted later)
    return this.boardsService.updateAllBoardColors();
  }

  @Post("reset-all")
  @UseGuards(JwtAuthGuard)
  resetAll(@Request() req) {
    // TEMPORARY: Delete all boards and tasks to reset the database
    // This should be removed after use
    return this.boardsService.deleteAllBoardsAndTasks();
  }
}
