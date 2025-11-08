import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({ default: "#CDB4DB" })
  color: string;

  @Prop({ ref: "Project", default: null })
  projectId: MongooseSchema.Types.ObjectId | null;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
