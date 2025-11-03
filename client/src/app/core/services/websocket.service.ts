import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  private readonly API_URL = 'http://localhost:3000';

  connect(): void {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(this.API_URL, {
        transports: ['websocket'],
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId: string): void {
    if (this.socket) {
      this.socket.emit('join-board', boardId);
    }
  }

  leaveBoard(boardId: string): void {
    if (this.socket) {
      this.socket.emit('leave-board', boardId);
    }
  }

  onTaskUpdate(): Observable<{ action: 'create' | 'update' | 'delete'; task: Task }> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('task-update', (data) => {
          observer.next(data);
        });
      }
    });
  }

  onBoardUpdate(): Observable<{ action: 'create' | 'update' | 'delete'; board: Board }> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('board-update', (data) => {
          observer.next(data);
        });
      }
    });
  }
}

