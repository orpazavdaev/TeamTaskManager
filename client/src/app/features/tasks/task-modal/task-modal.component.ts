import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TasksService } from '../../../core/services/tasks.service';
import { UsersService, User } from '../../../core/services/users.service';
import { Task, TaskStatus, TaskPriority, CreateTaskDto } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css',
})
export class TaskModalComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() boardId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  taskForm: FormGroup;
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  availableLabels = signal<string[]>(['Bug', 'Feature', 'Enhancement', 'Documentation', 'Urgent']);
  availableUsers = signal<User[]>([]);
  selectedUsers = signal<User[]>([]);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: [TaskStatus.TODO],
      priority: [TaskPriority.MEDIUM],
      labels: [[]],
      assignedTo: [[]],
    });
  }

  ngOnInit(): void {
    // Load available users
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.availableUsers.set(users);
        // Set selected users if editing task
        if (this.task && this.task.assignedTo) {
          const selectedUserIds = this.task.assignedTo
            .map((u) => {
              if (typeof u === 'string') {
                return u;
              }
              return (u as any)._id || (u as any).id || '';
            })
            .filter((id) => id !== '');
          const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));
          this.selectedUsers.set(selectedUsers);
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });

    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        labels: this.task.labels || [],
        assignedTo:
          this.task.assignedTo
            ?.map((u) => {
              if (typeof u === 'string') {
                return u;
              }
              // Handle User object - check for both _id (from backend) and id (from model)
              return (u as any)._id || (u as any).id || '';
            })
            .filter((id) => id !== '') || [],
      });
    }
    this.taskForm.patchValue({ status: this.task?.status || TaskStatus.TODO });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData: CreateTaskDto = {
        ...formValue,
        boardId: this.boardId,
        assignedTo: this.selectedUsers().map((u) => u.id),
      };

      if (this.task) {
        // Update existing task
        this.tasksService.update(this.task._id, taskData).subscribe({
          next: () => {
            this.saved.emit();
          },
          error: (err) => {
            console.error('Error updating task:', err);
            alert('Failed to update task. Please try again.');
          },
        });
      } else {
        // Create new task
        this.tasksService.create(taskData).subscribe({
          next: () => {
            this.saved.emit();
          },
          error: (err) => {
            console.error('Error creating task:', err);
            alert('Failed to create task. Please try again.');
          },
        });
      }
    }
  }

  toggleLabel(label: string): void {
    const labels = this.taskForm.get('labels')?.value || [];
    const index = labels.indexOf(label);
    if (index > -1) {
      labels.splice(index, 1);
    } else {
      labels.push(label);
    }
    this.taskForm.patchValue({ labels });
  }

  isLabelSelected(label: string): boolean {
    const labels = this.taskForm.get('labels')?.value || [];
    return labels.includes(label);
  }

  toggleUser(user: User): void {
    const selected = this.selectedUsers();
    const index = selected.findIndex((u) => u.id === user.id);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(user);
    }
    this.selectedUsers.set([...selected]);
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers().some((u) => u.id === user.id);
  }

  getUserInitials(user: User): string {
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserAvatarColor(user: User): string {
    // Generate a consistent color based on user name using blue palette
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
    const index = user.name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  closeModal(): void {
    this.close.emit();
  }
}
