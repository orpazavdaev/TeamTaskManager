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
  create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    return this.boardsService.create(createBoardDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.boardsService.findAll(req.user.userId);
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
}

