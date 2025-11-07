import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BoardsService } from "./boards.service";
import { BoardsController } from "./boards.controller";
import { Board, BoardSchema } from "./schemas/board.schema";
import { Task, TaskSchema } from "../tasks/schemas/task.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
