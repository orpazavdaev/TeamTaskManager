import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TasksService } from '../../core/services/tasks.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  // Export TaskStatus for template use
  TaskStatus = TaskStatus;

  tasks = signal<Task[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Group tasks by status
  todoTasks = computed(() => this.tasks().filter((task) => task.status === TaskStatus.TODO));
  inProgressTasks = computed(() =>
    this.tasks().filter((task) => task.status === TaskStatus.IN_PROGRESS)
  );
  doneTasks = computed(() => this.tasks().filter((task) => task.status === TaskStatus.DONE));

  user = computed(() => this.authService.user());

  constructor(private tasksService: TasksService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.tasksService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load tasks. Please try again.');
        this.loading.set(false);
        console.error('Error loading tasks:', err);
      },
    });
  }

  getStatusLabel(status: TaskStatus | string): string {
    const statusStr = typeof status === 'string' ? status : status;
    switch (statusStr) {
      case TaskStatus.TODO:
      case 'TODO':
        return '📋 TO DO';
      case TaskStatus.IN_PROGRESS:
      case 'IN_PROGRESS':
        return '🔄 IN PROGRESS';
      case TaskStatus.DONE:
      case 'DONE':
        return '✅ DONE';
      default:
        return String(status);
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
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

  navigateToBoard(boardId: string | any): void {
    const id = typeof boardId === 'string' ? boardId : boardId?._id || boardId;
    if (id) {
      window.location.href = `/boards/${id}`;
    }
  }

  getBoardColor(boardId: string | any): string {
    if (typeof boardId === 'string') {
      return '#d782ba';
    }
    return (boardId as any)?.color || '#d782ba';
  }

  getBoardName(boardId: string | any): string {
    if (typeof boardId === 'string') {
      return 'Unknown Board';
    }
    return (boardId as any)?.name || 'Unknown Board';
  }

  // Generate a random color for each task border based on task ID
  getTaskBorderColor(taskId: string): string {
    const colors = [
      '#d782ba' /* Sky magenta */,
      '#e18ad4' /* Violet */,
      '#eeb1d5' /* Lavender pink */,
      '#efc7e5' /* Thistle */,
      '#a8d5ba' /* Mint */,
      '#b8e6d3' /* Light mint */,
      '#c4e1d4' /* Pale mint */,
      '#d4f1e4' /* Very light mint */,
      '#f4c2c2' /* Light pink */,
      '#f9d5d5' /* Very light pink */,
      '#e8d4c4' /* Beige */,
      '#f0e6d4' /* Light beige */,
      '#d4c4e8' /* Lavender */,
      '#e4d4f0' /* Light lavender */,
      '#c4d4e8' /* Light blue */,
      '#d4e4f0' /* Very light blue */,
    ];
    // Use task ID to generate a consistent color for each task
    const hash = taskId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }
}
