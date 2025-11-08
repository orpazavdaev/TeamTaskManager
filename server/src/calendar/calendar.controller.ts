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
  Query,
} from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { UpdateCalendarEventDto } from "./dto/update-calendar-event.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("calendar")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createEventDto: CreateCalendarEventDto, @Request() req) {
    return this.calendarService.create(createEventDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query("projectId") projectId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.calendarService.findAll(
      req.user.userId,
      projectId,
      startDate,
      endDate
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.calendarService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateEventDto: UpdateCalendarEventDto,
    @Request() req
  ) {
    return this.calendarService.update(id, updateEventDto, req.user.userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.calendarService.remove(id, req.user.userId);
  }
}
