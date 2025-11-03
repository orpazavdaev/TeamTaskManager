import { User } from './user.model';

export interface Board {
  _id: string;
  name: string;
  description?: string;
  ownerId: string | User;
  members: (string | User)[];
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBoardDto {
  name: string;
  description?: string;
  color?: string;
  members?: string[];
}

