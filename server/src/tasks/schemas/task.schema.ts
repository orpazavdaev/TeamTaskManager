import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type TaskDocument = Task & Document;

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ required: true, ref: "Board" })
  boardId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, ref: "User" })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: "User", default: [] })
  assignedTo: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ default: 0 })
  order: number; // For drag & drop ordering
}

export const TaskSchema = SchemaFactory.createForClass(Task);
