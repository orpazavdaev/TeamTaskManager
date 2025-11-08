import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  CalendarEvent,
  CalendarEventDocument,
  EventType,
} from "./schemas/calendar-event.schema";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { UpdateCalendarEventDto } from "./dto/update-calendar-event.dto";
import { AppGateway } from "../app.gateway";
import { ProjectsService } from "../projects/projects.service";

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name)
    private calendarEventModel: Model<CalendarEventDocument>,
    private appGateway: AppGateway,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService
  ) {}

  async create(createEventDto: CreateCalendarEventDto, userId: string) {
    // Verify user has access to project
    await this.projectsService.findOne(createEventDto.projectId, userId);

    const event = new this.calendarEventModel({
      ...createEventDto,
      date: new Date(createEventDto.date),
      endDate: createEventDto.endDate ? new Date(createEventDto.endDate) : null,
      startTime: createEventDto.startTime || null,
      endTime: createEventDto.endTime || null,
      isAllDay: createEventDto.isAllDay || false,
      createdBy: userId,
    });
    const savedEvent = await event.save();
    const populatedEvent = await this.calendarEventModel
      .findById(savedEvent._id)
      .populate("createdBy", "name email")
      .populate("projectId", "name color")
      .populate("boardId", "name color")
      .populate("taskId", "title")
      .lean();

    const serializedEvent = {
      ...populatedEvent,
      _id: populatedEvent._id.toString(),
      projectId: populatedEvent.projectId
        ? (populatedEvent.projectId as any)._id?.toString() ||
          (populatedEvent.projectId as any).id
        : populatedEvent.projectId,
      boardId: populatedEvent.boardId
        ? (populatedEvent.boardId as any)._id?.toString() ||
          (populatedEvent.boardId as any).id
        : populatedEvent.boardId,
      taskId: populatedEvent.taskId
        ? (populatedEvent.taskId as any)._id?.toString() ||
          (populatedEvent.taskId as any).id
        : populatedEvent.taskId,
      createdBy: populatedEvent.createdBy
        ? {
            _id:
              (populatedEvent.createdBy as any)._id?.toString() ||
              (populatedEvent.createdBy as any).id,
            name: (populatedEvent.createdBy as any).name,
            email: (populatedEvent.createdBy as any).email,
          }
        : populatedEvent.createdBy,
    };

    this.appGateway.broadcastCalendarEventUpdate(serializedEvent, "create");
    return serializedEvent;
  }

  async findAll(
    userId: string,
    projectId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const query: any = {};

    // Filter by project if provided
    if (projectId) {
      // Verify user has access to project
      await this.projectsService.findOne(projectId, userId);
      query.projectId = projectId;
    } else {
      // Get all projects user has access to
      const projects = await this.projectsService.findAll(userId);
      const projectIds = projects.map((p) => p._id.toString());
      query.projectId = { $in: projectIds };
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const events = await this.calendarEventModel
      .find(query)
      .populate("createdBy", "name email")
      .populate("projectId", "name color")
      .populate("boardId", "name color")
      .populate("taskId", "title")
      .sort({ date: 1 })
      .lean();

    return events.map((event) => ({
      ...event,
      _id: event._id.toString(),
      projectId: event.projectId
        ? (event.projectId as any)._id?.toString() ||
          (event.projectId as any).id
        : event.projectId,
      boardId: event.boardId
        ? (event.boardId as any)._id?.toString() || (event.boardId as any).id
        : event.boardId,
      taskId: event.taskId
        ? (event.taskId as any)._id?.toString() || (event.taskId as any).id
        : event.taskId,
      createdBy: event.createdBy
        ? {
            _id:
              (event.createdBy as any)._id?.toString() ||
              (event.createdBy as any).id,
            name: (event.createdBy as any).name,
            email: (event.createdBy as any).email,
          }
        : event.createdBy,
    }));
  }

  async findOne(id: string, userId: string) {
    const event = await this.calendarEventModel
      .findById(id)
      .populate("createdBy", "name email")
      .populate("projectId", "name color")
      .populate("boardId", "name color")
      .populate("taskId", "title")
      .lean();

    if (!event) {
      throw new NotFoundException("Calendar event not found");
    }

    // Verify user has access to project
    await this.projectsService.findOne(
      (event.projectId as any)._id?.toString() || (event.projectId as any).id,
      userId
    );

    return {
      ...event,
      _id: event._id.toString(),
      projectId: event.projectId
        ? (event.projectId as any)._id?.toString() ||
          (event.projectId as any).id
        : event.projectId,
      boardId: event.boardId
        ? (event.boardId as any)._id?.toString() || (event.boardId as any).id
        : event.boardId,
      taskId: event.taskId
        ? (event.taskId as any)._id?.toString() || (event.taskId as any).id
        : event.taskId,
      createdBy: event.createdBy
        ? {
            _id:
              (event.createdBy as any)._id?.toString() ||
              (event.createdBy as any).id,
            name: (event.createdBy as any).name,
            email: (event.createdBy as any).email,
          }
        : event.createdBy,
    };
  }

  async update(
    id: string,
    updateEventDto: UpdateCalendarEventDto,
    userId: string
  ) {
    const event = await this.calendarEventModel.findById(id);

    if (!event) {
      throw new NotFoundException("Calendar event not found");
    }

    // Verify user has access to project
    await this.projectsService.findOne(event.projectId.toString(), userId);

    // Only creator can update
    if (event.createdBy.toString() !== userId) {
      throw new ForbiddenException("Only the creator can update this event");
    }

    if (updateEventDto.date) {
      updateEventDto.date = new Date(updateEventDto.date) as any;
    }
    if (updateEventDto.endDate) {
      updateEventDto.endDate = new Date(updateEventDto.endDate) as any;
    }

    Object.assign(event, updateEventDto);
    const savedEvent = await event.save();
    const populatedEvent = await this.calendarEventModel
      .findById(savedEvent._id)
      .populate("createdBy", "name email")
      .populate("projectId", "name color")
      .populate("boardId", "name color")
      .populate("taskId", "title")
      .lean();

    const serializedEvent = {
      ...populatedEvent,
      _id: populatedEvent._id.toString(),
      projectId: populatedEvent.projectId
        ? (populatedEvent.projectId as any)._id?.toString() ||
          (populatedEvent.projectId as any).id
        : populatedEvent.projectId,
      boardId: populatedEvent.boardId
        ? (populatedEvent.boardId as any)._id?.toString() ||
          (populatedEvent.boardId as any).id
        : populatedEvent.boardId,
      taskId: populatedEvent.taskId
        ? (populatedEvent.taskId as any)._id?.toString() ||
          (populatedEvent.taskId as any).id
        : populatedEvent.taskId,
      createdBy: populatedEvent.createdBy
        ? {
            _id:
              (populatedEvent.createdBy as any)._id?.toString() ||
              (populatedEvent.createdBy as any).id,
            name: (populatedEvent.createdBy as any).name,
            email: (populatedEvent.createdBy as any).email,
          }
        : populatedEvent.createdBy,
    };

    this.appGateway.broadcastCalendarEventUpdate(serializedEvent, "update");
    return serializedEvent;
  }

  async remove(id: string, userId: string) {
    const event = await this.calendarEventModel.findById(id);

    if (!event) {
      throw new NotFoundException("Calendar event not found");
    }

    // Verify user has access to project
    await this.projectsService.findOne(event.projectId.toString(), userId);

    // Only creator can delete
    if (event.createdBy.toString() !== userId) {
      throw new ForbiddenException("Only the creator can delete this event");
    }

    await this.calendarEventModel.findByIdAndDelete(id);
    this.appGateway.broadcastCalendarEventUpdate({ _id: id }, "delete");
    return { message: "Calendar event deleted successfully" };
  }
}
