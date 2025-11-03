import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { Task, TaskSchema } from "./schemas/task.schema";
import { BoardsModule } from "../boards/boards.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    forwardRef(() => BoardsModule),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
