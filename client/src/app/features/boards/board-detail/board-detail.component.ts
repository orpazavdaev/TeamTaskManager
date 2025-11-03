import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TasksService } from '../../../core/services/tasks.service';
import { BoardsService } from '../../../core/services/boards.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { Board } from '../../../core/models/board.model';
import { TaskModalComponent } from '../../tasks/task-modal/task-modal.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CdkDropList, CdkDrag, TaskModalComponent],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.css',
})
export class BoardDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tasksService = inject(TasksService);
  private boardsService = inject(BoardsService);
  private wsService = inject(WebSocketService);

  boardId = signal<string>('');
  board = signal<Board | null>(null);
  tasks = signal<Task[]>([]);

  todoTasks = computed(() => this.tasks().filter((t) => t.status === TaskStatus.TODO));
  inProgressTasks = computed(() => this.tasks().filter((t) => t.status === TaskStatus.IN_PROGRESS));
  doneTasks = computed(() => this.tasks().filter((t) => t.status === TaskStatus.DONE));

  isLoading = signal(true);
  showTaskModal = signal(false);
  selectedTask = signal<Task | null>(null);

  private wsSubscription: any;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.boardId.set(params['id']);
      this.loadBoard();
      this.loadTasks();
    });

    this.wsService.connect();
    this.wsService.joinBoard(this.boardId());

    this.wsSubscription = this.wsService.onTaskUpdate().subscribe((update) => {
      if (update.action === 'create') {
        this.tasks.update((tasks) => [...tasks, update.task]);
      } else if (update.action === 'update') {
        this.tasks.update((tasks) =>
          tasks.map((t) => (t._id === update.task._id ? update.task : t))
        );
      } else if (update.action === 'delete') {
        this.tasks.update((tasks) => tasks.filter((t) => t._id !== update.task._id));
      }
    });
  }

  ngOnDestroy(): void {
    this.wsService.leaveBoard(this.boardId());
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  loadBoard(): void {
    this.boardsService.getById(this.boardId()).subscribe({
      next: (board) => this.board.set(board),
      error: () => this.router.navigate(['/boards']),
    });
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.tasksService.getByBoard(this.boardId()).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const previousStatus = task.status;

    let newStatus: TaskStatus;
    if (event.container.id === 'todo-list') {
      newStatus = TaskStatus.TODO;
    } else if (event.container.id === 'in-progress-list') {
      newStatus = TaskStatus.IN_PROGRESS;
    } else {
      newStatus = TaskStatus.DONE;
    }

    if (previousStatus !== newStatus) {
      // Update task status
      this.tasksService
        .move(task._id, {
          status: newStatus,
          order: event.currentIndex,
        })
        .subscribe({
          next: (updatedTask) => {
            this.tasks.update((tasks) =>
              tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
          },
          error: () => {
            // Revert on error
            this.loadTasks();
          },
        });
    } else {
      // Same column, just reorder
      const tasksArray = [...this.tasks()];
      const filteredTasks = tasksArray.filter((t) => t.status === newStatus);
      moveItemInArray(filteredTasks, event.previousIndex, event.currentIndex);

      // Update orders
      filteredTasks.forEach((task, index) => {
        if (task.order !== index) {
          this.tasksService
            .move(task._id, {
              status: task.status,
              order: index,
            })
            .subscribe();
        }
      });
    }
  }

  openTaskModal(task?: Task): void {
    this.selectedTask.set(task || null);
    this.showTaskModal.set(true);
  }

  closeTaskModal(): void {
    this.showTaskModal.set(false);
    this.selectedTask.set(null);
  }

  onTaskSaved(): void {
    this.closeTaskModal();
    this.loadTasks();
  }

  deleteTask(task: Task): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasksService.delete(task._id).subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter((t) => t._id !== task._id));
        },
      });
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }
}

