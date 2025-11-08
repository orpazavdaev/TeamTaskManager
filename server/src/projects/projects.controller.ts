import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Get("my-projects")
  findMyProjects(@Request() req) {
    return this.projectsService.findMyProjects(req.user.userId);
  }

  @Get("shared-projects")
  findSharedProjects(@Request() req) {
    return this.projectsService.findSharedProjects(req.user.userId);
  }

  @Get("public/search")
  searchPublicProjects(@Request() req) {
    const searchTerm = (req.query as any)?.q || "";
    return this.projectsService.searchPublicProjects(searchTerm);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.userId);
  }

  @Post(":id/boards/:boardId")
  addBoardToProject(
    @Param("id") projectId: string,
    @Param("boardId") boardId: string,
    @Request() req
  ) {
    return this.projectsService.addBoardToProject(
      projectId,
      boardId,
      req.user.userId
    );
  }

  @Delete(":id/boards/:boardId")
  removeBoardFromProject(
    @Param("id") projectId: string,
    @Param("boardId") boardId: string,
    @Request() req
  ) {
    return this.projectsService.removeBoardFromProject(
      projectId,
      boardId,
      req.user.userId
    );
  }

  @Post("update-colors")
  updateAllProjectColors() {
    return this.projectsService.updateAllProjectColors();
  }

  @Post(":id/members")
  addMemberToProject(
    @Param("id") projectId: string,
    @Body() body: { userId: string },
    @Request() req
  ) {
    return this.projectsService.addMemberToProject(
      projectId,
      body.userId,
      req.user.userId
    );
  }

  @Delete(":id/members/:userId")
  removeMemberFromProject(
    @Param("id") projectId: string,
    @Param("userId") userId: string,
    @Request() req
  ) {
    return this.projectsService.removeMemberFromProject(
      projectId,
      userId,
      req.user.userId
    );
  }
}
