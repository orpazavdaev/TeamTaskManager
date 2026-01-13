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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CdkDropList,
    CdkDrag,
    TaskModalComponent,
    ConfirmDialogComponent,
  ],
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
  projectId = signal<string | null>(null);
  board = signal<Board | null>(null);
  tasks = signal<Task[]>([]);

  todoTasks = computed(() => this.tasks().filter((t) => t.status === TaskStatus.TODO));
  inProgressTasks = computed(() => this.tasks().filter((t) => t.status === TaskStatus.IN_PROGRESS));
  doneTasks = computed(() => this.tasks().filter((t) => t.status === TaskStatus.DONE));

  isLoading = signal(true);
  showTaskModal = signal(false);
  selectedTask = signal<Task | null>(null);
  showDeleteDialog = signal(false);
  taskToDelete = signal<Task | null>(null);

  private wsSubscription: any;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.boardId.set(params['id']);
      this.projectId.set(params['projectId'] || null);
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
    const boardId = this.boardId();
    if (!boardId) {
      console.error('Board ID is missing');
      this.router.navigate(['/boards']);
      return;
    }
    this.boardsService.getById(boardId).subscribe({
      next: (board) => {
        this.board.set(board);
      },
      error: (err) => {
        console.error('Failed to load board:', err);
        if (err.status === 404) {
          console.error('Board not found or access denied');
        }
        this.router.navigate(['/boards']);
      },
    });
  }

  loadTasks(): void {
    const boardId = this.boardId();
    if (!boardId) {
      console.error('Board ID is missing for loading tasks');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.tasksService.getByBoard(boardId).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.isLoading.set(false);
      },
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const previousStatus = task.status;

    // Determine new status based on container ID
    let newStatus: TaskStatus;
    if (event.container.id === 'todo-list') {
      newStatus = TaskStatus.TODO;
    } else if (event.container.id === 'in-progress-list') {
      newStatus = TaskStatus.IN_PROGRESS;
    } else {
      newStatus = TaskStatus.DONE;
    }

    // Get source and destination arrays
    const currentTasks = [...this.tasks()];
    const previousTasks = currentTasks.filter((t) => t.status === previousStatus);
    const newTasks = currentTasks.filter((t) => t.status === newStatus);

    if (previousStatus !== newStatus) {
      // Moving between different columns - use transferArrayItem
      const sourceArray = [...previousTasks];
      const destArray = [...newTasks];

      // Find the task in source array
      const taskIndex = sourceArray.findIndex((t) => t._id === task._id);
      if (taskIndex === -1) return;

      // Transfer to destination (this modifies both arrays)
      transferArrayItem(sourceArray, destArray, taskIndex, event.currentIndex);

      // Update the transferred task's status
      const transferredTask = destArray[event.currentIndex];
      destArray[event.currentIndex] = { ...transferredTask, status: newStatus };

      // Rebuild all tasks with updated orders
      const otherTasks = currentTasks.filter(
        (t) => t.status !== previousStatus && t.status !== newStatus
      );
      const updatedTasks = [
        ...otherTasks,
        ...sourceArray.map((t, idx) => ({ ...t, order: idx })),
        ...destArray.map((t, idx) => ({ ...t, order: idx })),
      ];

      // Optimistic update - update UI immediately
      this.tasks.set(updatedTasks);

      // Send update to server
      this.tasksService
        .move(task._id, {
          status: newStatus,
          order: event.currentIndex,
        })
        .subscribe({
          next: (serverTask) => {
            // Update with server response
            this.tasks.update((tasks) =>
              tasks.map((t) => (t._id === serverTask._id ? serverTask : t))
            );
          },
          error: () => {
            // Revert on error
            this.loadTasks();
          },
        });
    } else {
      // Same column, just reorder
      const reorderedTasks = [...newTasks];
      moveItemInArray(reorderedTasks, event.previousIndex, event.currentIndex);

      // Update orders
      const otherTasks = currentTasks.filter((t) => t.status !== newStatus);
      const updatedTasks = [
        ...otherTasks,
        ...reorderedTasks.map((t, idx) => ({ ...t, order: idx })),
      ];

      // Optimistic update
      this.tasks.set(updatedTasks);

      // Update orders on server
      reorderedTasks.forEach((task, index) => {
        if (task.order !== index) {
          this.tasksService
            .move(task._id, {
              status: task.status,
              order: index,
            })
            .subscribe({
              next: (serverTask) => {
                this.tasks.update((tasks) =>
                  tasks.map((t) => (t._id === serverTask._id ? serverTask : t))
                );
              },
              error: () => {
                this.loadTasks();
              },
            });
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
    this.taskToDelete.set(task);
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const task = this.taskToDelete();
    if (task) {
      this.tasksService.delete(task._id).subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter((t) => t._id !== task._id));
          this.showDeleteDialog.set(false);
          this.taskToDelete.set(null);
        },
        error: () => {
          this.showDeleteDialog.set(false);
          this.taskToDelete.set(null);
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.taskToDelete.set(null);
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#e74c3c'; // Red - Hard
      case 'MEDIUM':
        return '#f39c12'; // Orange - Medium
      case 'LOW':
        return '#27ae60'; // Green - Easy
      default:
        return 'var(--text-secondary)';
    }
  }

  // Generate a random color for each task border based on task ID
  getTaskBorderColor(taskId: string): string {
    const colors = [
      '#012A4A' /* Dark navy blue */,
      '#013A63' /* Dark blue */,
      '#01497C' /* Medium-dark blue */,
      '#014F86' /* Slightly lighter medium-dark blue */,
      '#2A6F97' /* Medium blue with teal hint */,
      '#2C7DA0' /* Medium teal-blue */,
      '#468FAF' /* Light muted blue */,
      '#61A5C2' /* Light sky blue */,
      '#89C2D9' /* Very light blue */,
      '#A9D6E5' /* Pale almost white blue */,
      '#012A4A' /* Repeat for more variety */,
      '#013A63' /* Repeat */,
      '#01497C' /* Repeat */,
      '#2A6F97' /* Repeat */,
      '#61A5C2' /* Repeat */,
      '#89C2D9' /* Repeat */,
    ];
    // Use task ID to generate a consistent color for each task
    const hash = taskId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  getAssigneeName(assignee: string | any): string {
    if (!assignee) {
      return '';
    }
    if (typeof assignee === 'string') {
      return '';
    }
    // Check if it's a populated object with name/email
    if (assignee.name) {
      return assignee.name;
    }
    if (assignee.email) {
      return assignee.email.split('@')[0];
    }
    // Check if it's an object with _id but no name (not populated)
    if (assignee._id) {
      return '';
    }
    return '';
  }

  getAssigneeInitials(assignee: string | any): string {
    if (!assignee) {
      return '?';
    }
    if (typeof assignee === 'string') {
      return '?';
    }
    // Check if it's a populated object with name
    if (assignee.name) {
      const name = assignee.name.trim();
      if (name.length === 0) {
        return '?';
      }
      const parts = name.split(' ').filter((n: string) => n.length > 0);
      if (parts.length === 0) {
        return '?';
      }
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // Check if it's a populated object with email but no name
    if (assignee.email) {
      return assignee.email.substring(0, 2).toUpperCase();
    }
    // If it has _id but no name/email, it's not populated - return ?
    if (assignee._id) {
      return '?';
    }
    return '?';
  }

  getAssigneeAvatarColor(assignee: string | any): string {
    if (!assignee) {
      return '#64748b';
    }
    if (typeof assignee === 'string') {
      return '#64748b';
    }
    const name = assignee.name || assignee.email || '';
    if (name.length === 0) {
      return '#64748b';
    }
    const colors = [
      '#2A6F97' /* Medium blue with teal hint */,
      '#2C7DA0' /* Medium teal-blue */,
      '#468FAF' /* Light muted blue */,
      '#61A5C2' /* Light sky blue */,
      '#89C2D9' /* Very light blue */,
      '#A9D6E5' /* Pale almost white blue */,
      '#01497C' /* Medium-dark blue */,
      '#014F86' /* Slightly lighter medium-dark blue */,
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getBackLink(): string {
    const projectId = this.projectId();
    if (projectId) {
      return `/projects/${projectId}`;
    }
    return '/boards';
  }
}
