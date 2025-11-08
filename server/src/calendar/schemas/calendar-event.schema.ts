import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as MongooseSchema from "mongoose";

export type CalendarEventDocument = CalendarEvent & Document;

export enum EventType {
  TASK_DUE = "task_due",
  TASK_START = "task_start",
  SPRINT_START = "sprint_start",
  SPRINT_END = "sprint_end",
  CUSTOM = "custom",
}

@Schema({ timestamps: true })
export class CalendarEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: null })
  endDate?: Date | null;

  @Prop({ default: null })
  startTime?: string | null;

  @Prop({ default: null })
  endTime?: string | null;

  @Prop({ default: false })
  isAllDay: boolean;

  @Prop({ required: true, enum: EventType })
  type: EventType;

  @Prop({ required: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ ref: "Board", default: null })
  boardId?: MongooseSchema.Types.ObjectId | null;

  @Prop({ ref: "Task", default: null })
  taskId?: MongooseSchema.Types.ObjectId | null;

  @Prop({ required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: "#2A6F97" })
  color: string;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
