import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsMongoId,
} from "class-validator";
import { EventType } from "../schemas/calendar-event.schema";

export class CreateCalendarEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsDateString()
  @IsOptional()
  endDate?: string | null;

  @IsString()
  @IsOptional()
  startTime?: string | null;

  @IsString()
  @IsOptional()
  endTime?: string | null;

  @IsOptional()
  isAllDay?: boolean;

  @IsEnum(EventType)
  type: EventType;

  @IsMongoId()
  projectId: string;

  @IsMongoId()
  @IsOptional()
  boardId?: string | null;

  @IsMongoId()
  @IsOptional()
  taskId?: string | null;

  @IsString()
  @IsOptional()
  color?: string;
}
