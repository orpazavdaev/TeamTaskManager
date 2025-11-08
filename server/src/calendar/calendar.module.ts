import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";
import {
  CalendarEvent,
  CalendarEventSchema,
} from "./schemas/calendar-event.schema";
import { ProjectsModule } from "../projects/projects.module";
import { GatewayModule } from "../gateway.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
    ]),
    forwardRef(() => ProjectsModule),
    GatewayModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
