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
  publicProjects = signal<Project[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  publicSearchTerm = signal('');
  isCreating = signal(false);
  errorMessage = signal('');
  showCreateDialog = signal(false);
  isSearchingPublic = signal(false);

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      // Update all project colors to new blue palette
      this.projectsService.updateAllColors().subscribe({
        next: (result) => {
          console.log('Updated project colors:', result);
        },
        error: (err) => {
          console.error('Failed to update project colors:', err);
        },
      });
      this.loadProjects();
      this.wsService.connect();
      // Load all public projects automatically
      this.loadAllPublicProjects();
    } else {
      setTimeout(() => {
        const tokenAfterWait = this.authService.getToken();
        if (tokenAfterWait) {
          // Update all project colors to new blue palette
          this.projectsService.updateAllColors().subscribe({
            next: (result) => {
              console.log('Updated project colors:', result);
            },
            error: (err) => {
              console.error('Failed to update project colors:', err);
            },
          });
          this.loadProjects();
          this.wsService.connect();
          // Load all public projects automatically
          this.loadAllPublicProjects();
        } else {
          this.loadProjects();
          // Load all public projects automatically even without token
          this.loadAllPublicProjects();
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

  loadAllPublicProjects(): void {
    // Load all public projects automatically on page load
    this.publicSearchTerm.set('');
    this.searchPublicProjects();
  }

  searchPublicProjects(): void {
    const term = this.publicSearchTerm().trim();
    // Allow empty search to show all public projects
    this.isSearchingPublic.set(true);
    console.log('Searching for public projects with term:', term);
    this.projectsService.searchPublicProjects(term || undefined).subscribe({
      next: (projects) => {
        console.log('Public projects found:', projects.length, projects);
        // Filter out projects that the user already has access to
        const currentUser = this.authService.user();
        if (!currentUser) {
          this.publicProjects.set(projects);
          this.isSearchingPublic.set(false);
          return;
        }

        console.log('Current user:', currentUser.id);
        console.log(
          'My projects:',
          this.myProjects().map((p) => p._id)
        );
        console.log(
          'Shared projects:',
          this.sharedProjects().map((p) => p._id)
        );

        const myProjectIds = new Set([
          ...this.myProjects().map((p) => p._id),
          ...this.sharedProjects().map((p) => p._id),
        ]);

        const filteredProjects = projects.filter((project) => {
          // Exclude projects the user already owns or is a member of
          const ownerId =
            typeof project.ownerId === 'string'
              ? project.ownerId
              : (project.ownerId as any)?._id?.toString() || (project.ownerId as any)?.id;

          console.log(
            'Checking project:',
            project.name,
            'ownerId:',
            ownerId,
            'currentUser.id:',
            currentUser.id
          );
          console.log('  ownerId === currentUser.id?', ownerId === currentUser.id);
          console.log(
            '  ownerId type:',
            typeof ownerId,
            'currentUser.id type:',
            typeof currentUser.id
          );

          // Use String() to ensure proper comparison
          if (String(ownerId) === String(currentUser.id)) {
            console.log('Excluding project (owner):', project.name, project._id);
            return false;
          }

          const memberIds = (project.members || []).map((m: any) => {
            return typeof m === 'string' ? String(m) : String(m._id || m.id);
          });
          console.log(
            '  memberIds:',
            memberIds,
            'includes?',
            memberIds.includes(String(currentUser.id))
          );
          if (memberIds.includes(String(currentUser.id))) {
            console.log('Excluding project (member):', project.name, project._id);
            return false;
          }

          // Exclude projects already in myProjects or sharedProjects
          const projectIdStr = String(project._id);
          const myProjectIdsStr = new Set(Array.from(myProjectIds).map((id) => String(id)));
          if (myProjectIdsStr.has(projectIdStr)) {
            console.log('Excluding project (already in list):', project.name, project._id);
            return false;
          }

          console.log(
            'Including project:',
            project.name,
            project._id,
            'isPublic:',
            project.isPublic
          );
          return true;
        });

        console.log('Filtered public projects:', filteredProjects.length, filteredProjects);
        this.publicProjects.set(filteredProjects);
        this.isSearchingPublic.set(false);
      },
      error: (err) => {
        console.error('Failed to search public projects:', err);
        this.isSearchingPublic.set(false);
        this.publicProjects.set([]);
      },
    });
  }

  filteredPublicProjects() {
    return this.publicProjects();
  }

  createProject(): void {
    this.showCreateDialog.set(true);
  }

  confirmCreateProject(data: string | { name: string; isPublic: boolean }): void {
    const projectData =
      typeof data === 'string'
        ? { name: data.trim(), isPublic: false }
        : { name: data.name.trim(), isPublic: data.isPublic };

    if (projectData.name) {
      this.isCreating.set(true);
      this.errorMessage.set('');
      this.showCreateDialog.set(false);

      this.projectsService.create(projectData).subscribe({
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

  getOwnerName(project: Project): string {
    if (typeof project.ownerId === 'string') {
      return 'Unknown';
    }
    return (project.ownerId as any)?.name || 'Unknown';
  }
}
