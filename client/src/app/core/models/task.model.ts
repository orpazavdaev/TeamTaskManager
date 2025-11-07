import { User } from './user.model';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  boardId: string;
  createdBy: string | User;
  assignedTo: (string | User)[];
  labels: string[];
  priority: TaskPriority;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  boardId: string;
  assignedTo?: string[];
  labels?: string[];
  priority?: TaskPriority;
  order?: number;
}

export interface MoveTaskDto {
  status: TaskStatus;
  order: number;
}
