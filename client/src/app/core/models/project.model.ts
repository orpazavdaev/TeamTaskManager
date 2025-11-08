import { Board } from './board.model';
import { User } from './user.model';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string | User;
  members: (string | User)[];
  boards: (string | Board)[];
  activeBoardId: string | Board | null;
  color: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  members?: string[];
  isPublic?: boolean;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  members?: string[];
  activeBoardId?: string;
  isPublic?: boolean;
}
