import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
} from "class-validator";
import { TaskStatus, TaskPriority } from "../schemas/task.schema";

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  boardId: string;

  @IsArray()
  @IsOptional()
  assignedTo?: string[];

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsNumber()
  @IsOptional()
  order?: number;
}

