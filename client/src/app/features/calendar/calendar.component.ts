import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarService } from '../../core/services/calendar.service';
import { ProjectsService } from '../../core/services/projects.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import {
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  EventType,
} from '../../core/models/calendar-event.model';
import { Project } from '../../core/models/project.model';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { InputDialogComponent } from '../../shared/components/input-dialog/input-dialog.component';
import { SelectDialogComponent } from '../../shared/components/select-dialog/select-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputDialogComponent, SelectDialogComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit, OnDestroy {
  private calendarService = inject(CalendarService);
  private projectsService = inject(ProjectsService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  currentDate = signal(new Date());
  events = signal<CalendarEvent[]>([]);
  projects = signal<Project[]>([]);
  selectedProject = signal<string | null>(null);
  isLoading = signal(false);
  showCreateDialog = signal(false);
  showEditDialog = signal(false);
  selectedEvent = signal<CalendarEvent | null>(null);
  errorMessage = signal('');

  eventForm: FormGroup;

  constructor() {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      date: ['', [Validators.required]],
      endDate: [null],
      startTime: [null],
      endTime: [null],
      isAllDay: [false],
      type: [EventType.CUSTOM, [Validators.required]],
      projectId: ['', [Validators.required]],
      boardId: [null],
      taskId: [null],
      color: ['#2A6F97'],
    });
  }

  // Calendar grid
  calendarDays = computed(() => {
    const date = this.currentDate();
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  });

  // Events for current month
  monthEvents = computed(() => {
    const days = this.calendarDays();
    const monthStart = days[0];
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = days[days.length - 1];
    monthEnd.setHours(23, 59, 59, 999);
    return this.events().filter((event) => {
      const eventStartDate = new Date(event.date);
      eventStartDate.setHours(0, 0, 0, 0);
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      eventEndDate.setHours(23, 59, 59, 999);
      // Check if event overlaps with the month
      return eventStartDate <= monthEnd && eventEndDate >= monthStart;
    });
  });

  // Get events for a specific day
  getEventsForDay(day: Date): CalendarEvent[] {
    return this.monthEvents().filter((event) => {
      const eventStartDate = new Date(event.date);
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Check if event overlaps with the day
      return eventStartDate <= dayEnd && eventEndDate >= dayStart;
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadEvents();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  loadProjects(): void {
    this.projectsService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
      },
      error: (err) => {
        console.error('Failed to load projects:', err);
      },
    });
  }

  loadEvents(): void {
    this.isLoading.set(true);
    const date = this.currentDate();
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    this.calendarService
      .findAll(
        this.selectedProject() || undefined,
        format(monthStart, 'yyyy-MM-dd'),
        format(monthEnd, 'yyyy-MM-dd')
      )
      .subscribe({
        next: (events) => {
          this.events.set(events);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load events:', err);
          this.isLoading.set(false);
        },
      });
  }

  private wsSubscription: any;

  subscribeToWebSocket(): void {
    this.wsService.connect();
    this.wsSubscription = this.wsService.onCalendarEventUpdate().subscribe((update) => {
      const { action, event } = update;
      if (action === 'create') {
        // Check if event already exists to prevent duplicates
        this.events.update((events) => {
          const exists = events.some((e) => e._id === event._id);
          if (exists) {
            return events;
          }
          return [...events, event];
        });
      } else if (action === 'update') {
        this.events.update((events) => events.map((e) => (e._id === event._id ? event : e)));
      } else if (action === 'delete') {
        this.events.update((events) => events.filter((e) => e._id !== event._id));
      }
    });
  }

  previousMonth(): void {
    this.currentDate.set(subMonths(this.currentDate(), 1));
    this.loadEvents();
  }

  nextMonth(): void {
    this.currentDate.set(addMonths(this.currentDate(), 1));
    this.loadEvents();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadEvents();
  }

  onProjectFilterChange(projectId: string | null): void {
    this.selectedProject.set(projectId);
    this.loadEvents();
  }

  openCreateDialog(day?: Date): void {
    if (day) {
      this.eventForm.patchValue({
        date: format(day, 'yyyy-MM-dd'),
      });
    }
    if (this.selectedProject()) {
      this.eventForm.patchValue({
        projectId: this.selectedProject(),
      });
    }
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
    this.eventForm.reset({
      type: EventType.CUSTOM,
      color: '#2A6F97',
      boardId: null,
      taskId: null,
      endDate: null,
      startTime: null,
      endTime: null,
      isAllDay: false,
    });
  }

  createEvent(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const eventData: CreateCalendarEventDto = {
        title: formValue.title,
        description: formValue.description || undefined,
        date: new Date(formValue.date).toISOString(),
        endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null,
        startTime: formValue.isAllDay ? null : formValue.startTime || null,
        endTime: formValue.isAllDay ? null : formValue.endTime || null,
        isAllDay: formValue.isAllDay || false,
        type: formValue.type,
        projectId: formValue.projectId,
        boardId: formValue.boardId && formValue.boardId.trim() ? formValue.boardId : undefined,
        taskId: formValue.taskId && formValue.taskId.trim() ? formValue.taskId : undefined,
        color: formValue.color || '#2A6F97',
      };
      this.calendarService.create(eventData).subscribe({
        next: () => {
          this.closeCreateDialog();
          // Don't reload events - WebSocket will handle the update
          // this.loadEvents();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create event. Please try again.');
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  openEditDialog(event: CalendarEvent): void {
    this.selectedEvent.set(event);
    this.eventForm.patchValue({
      title: event.title,
      description: event.description || '',
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : null,
      startTime: event.startTime || null,
      endTime: event.endTime || null,
      isAllDay: event.isAllDay || false,
      type: event.type,
      projectId: typeof event.projectId === 'string' ? event.projectId : event.projectId._id,
      boardId: event.boardId
        ? typeof event.boardId === 'string'
          ? event.boardId
          : event.boardId._id
        : null,
      taskId: event.taskId
        ? typeof event.taskId === 'string'
          ? event.taskId
          : event.taskId._id
        : null,
      color: event.color,
    });
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.selectedEvent.set(null);
    this.eventForm.reset({
      type: EventType.CUSTOM,
      color: '#2A6F97',
      boardId: null,
      taskId: null,
      endDate: null,
      startTime: null,
      endTime: null,
      isAllDay: false,
    });
  }

  updateEvent(): void {
    if (this.eventForm.valid && this.selectedEvent()) {
      const formValue = this.eventForm.value;
      const eventData: UpdateCalendarEventDto = {
        title: formValue.title,
        description: formValue.description || undefined,
        date: new Date(formValue.date).toISOString(),
        endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null,
        startTime: formValue.isAllDay ? null : formValue.startTime || null,
        endTime: formValue.isAllDay ? null : formValue.endTime || null,
        isAllDay: formValue.isAllDay || false,
        type: formValue.type,
        boardId: formValue.boardId && formValue.boardId.trim() ? formValue.boardId : undefined,
        taskId: formValue.taskId && formValue.taskId.trim() ? formValue.taskId : undefined,
        color: formValue.color || '#2A6F97',
      };
      this.calendarService.update(this.selectedEvent()!._id, eventData).subscribe({
        next: () => {
          this.closeEditDialog();
          // Don't reload events - WebSocket will handle the update
          // this.loadEvents();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to update event. Please try again.');
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  deleteEvent(event: CalendarEvent): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.calendarService.delete(event._id).subscribe({
        next: () => {
          // Don't reload events - WebSocket will handle the update
          // this.loadEvents();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to delete event. Please try again.');
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  // Helper methods
  isCurrentMonth(day: Date): boolean {
    return isSameMonth(day, this.currentDate());
  }

  isTodayDate(day: Date): boolean {
    return isToday(day);
  }

  getMonthYear(): string {
    return format(this.currentDate(), 'MMMM yyyy');
  }

  getEventTypeLabel(type: EventType): string {
    const labels: Record<EventType, string> = {
      [EventType.TASK_DUE]: 'Task Due',
      [EventType.TASK_START]: 'Task Start',
      [EventType.SPRINT_START]: 'Sprint Start',
      [EventType.SPRINT_END]: 'Sprint End',
      [EventType.CUSTOM]: 'Custom',
    };
    return labels[type] || type;
  }

  getEventTypeOptions() {
    return Object.values(EventType).map((type) => ({
      value: type,
      label: this.getEventTypeLabel(type),
    }));
  }

  getProjectOptions() {
    return this.projects().map((project) => ({
      value: project._id,
      label: project.name,
    }));
  }

  // Expose format function and Date constructor to template
  format = format;
  Date = Date;

  formatEventTime(event: CalendarEvent): string {
    if (event.isAllDay) {
      return 'All Day';
    }
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    if (event.startTime) {
      return event.startTime;
    }
    return format(new Date(event.date), 'HH:mm');
  }

  isMultiDayEvent(event: CalendarEvent): boolean {
    if (!event.endDate) return false;
    const startDate = new Date(event.date);
    const endDate = new Date(event.endDate);
    return !isSameDay(startDate, endDate);
  }
}
