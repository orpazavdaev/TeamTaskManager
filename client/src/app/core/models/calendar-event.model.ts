import { User } from './user.model';
import { Project } from './project.model';
import { Board } from './board.model';
import { Task } from './task.model';

export enum EventType {
  TASK_DUE = 'task_due',
  TASK_START = 'task_start',
  SPRINT_START = 'sprint_start',
  SPRINT_END = 'sprint_end',
  CUSTOM = 'custom',
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  type: EventType;
  projectId: string | Project;
  boardId?: string | Board | null;
  taskId?: string | Task | null;
  createdBy: string | User;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  type: EventType;
  projectId: string;
  boardId?: string;
  taskId?: string;
  color?: string;
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  date?: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  type?: EventType;
  boardId?: string | null;
  taskId?: string | null;
  color?: string;
}
