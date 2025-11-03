import { IsEnum, IsNumber } from "class-validator";
import { TaskStatus } from "../schemas/task.schema";

export class MoveTaskDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNumber()
  order: number;
}

