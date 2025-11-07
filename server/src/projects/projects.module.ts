import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { Project, ProjectSchema } from "./schemas/project.schema";
import { Board, BoardSchema } from "../boards/schemas/board.schema";
import { AppModule } from "../app.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Board.name, schema: BoardSchema },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
