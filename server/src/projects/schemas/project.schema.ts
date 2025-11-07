import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: "Board", default: [] })
  boards: MongooseSchema.Types.ObjectId[];

  @Prop({ ref: "Board", default: null })
  activeBoardId: MongooseSchema.Types.ObjectId | null;

  @Prop({ default: "#d782ba" })
  color: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
