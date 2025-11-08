import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { Project } from '../../../core/models/project.model';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { InputDialogComponent } from '../../../shared/components/input-dialog/input-dialog.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, InputDialogComponent],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css',
})
export class ProjectsListComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);

  myProjects = signal<Project[]>([]);
  sharedProjects = signal<Project[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  isCreating = signal(false);
  errorMessage = signal('');
  showCreateDialog = signal(false);

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.loadProjects();
      this.wsService.connect();
    } else {
      setTimeout(() => {
        const tokenAfterWait = this.authService.getToken();
        if (tokenAfterWait) {
          this.loadProjects();
          this.wsService.connect();
        } else {
          this.loadProjects();
        }
      }, 300);
    }

    // Listen for project updates
    this.wsService.onProjectUpdate().subscribe((update) => {
      if (update.action === 'delete') {
        this.myProjects.update((projects) => projects.filter((p) => p._id !== update.project._id));
        this.sharedProjects.update((projects) =>
          projects.filter((p) => p._id !== update.project._id)
        );
      } else if (update.action === 'create') {
        // Check if project already exists to avoid duplicates
        this.myProjects.update((projects) => {
          const exists = projects.some((p) => p._id === update.project._id);
          if (exists) {
            return projects;
          }
          return [...projects, update.project];
        });
      } else if (update.action === 'update') {
        this.myProjects.update((projects) =>
          projects.map((p) => (p._id === update.project._id ? update.project : p))
        );
        this.sharedProjects.update((projects) =>
          projects.map((p) => (p._id === update.project._id ? update.project : p))
        );
      }
    });
  }

  loadProjects(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage.set('Authentication required. Please log in again.');
      this.isLoading.set(false);
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 1000);
      return;
    }

    this.isLoading.set(true);

    this.projectsService.getMyProjects().subscribe({
      next: (projects) => {
        this.myProjects.set(projects);
        this.isLoading.set(false);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Session expired. Please log in again.');
          this.authService.logout();
        } else {
          this.errorMessage.set(err.error?.message || 'Failed to load projects. Please try again.');
        }
      },
    });

    this.projectsService.getSharedProjects().subscribe({
      next: (projects) => {
        this.sharedProjects.set(projects);
      },
      error: (err) => {
        console.error('Failed to load shared projects:', err);
      },
    });
  }

  filteredMyProjects() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.myProjects();
    return this.myProjects().filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term)
    );
  }

  filteredSharedProjects() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.sharedProjects();
    return this.sharedProjects().filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term)
    );
  }

  createProject(): void {
    this.showCreateDialog.set(true);
  }

  confirmCreateProject(name: string): void {
    if (name && name.trim()) {
      this.isCreating.set(true);
      this.errorMessage.set('');
      this.showCreateDialog.set(false);

      this.projectsService.create({ name: name.trim() }).subscribe({
        next: (project) => {
          this.isCreating.set(false);
          // Don't add here - WebSocket will handle it to avoid duplicates
          // Just navigate to the new project
          this.router.navigate(['/projects', project._id]);
        },
        error: (err) => {
          this.isCreating.set(false);
          this.errorMessage.set(
            err.error?.message || 'Failed to create project. Please try again.'
          );
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  cancelCreateProject(): void {
    this.showCreateDialog.set(false);
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
}
