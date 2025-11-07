import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { BoardsService } from '../../../core/services/boards.service';
import { Project } from '../../../core/models/project.model';
import { Board } from '../../../core/models/board.model';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { InputDialogComponent } from '../../../shared/components/input-dialog/input-dialog.component';
import { SelectDialogComponent } from '../../../shared/components/select-dialog/select-dialog.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, InputDialogComponent, SelectDialogComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);
  private boardsService = inject(BoardsService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);

  projectId = signal<string>('');
  project = signal<Project | null>(null);
  allBoards = signal<Board[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  isCreating = signal(false);
  errorMessage = signal('');
  showCreateDialog = signal(false);
  showAddBoardDialog = signal(false);

  // Get boards that belong to this project
  projectBoards = computed(() => {
    const project = this.project();
    if (!project) return [];
    return this.allBoards().filter((board) => {
      const boardId = typeof board._id === 'string' ? board._id : String(board._id);
      return project.boards.some((b) => {
        const bId = typeof b === 'string' ? b : (b as any)._id?.toString() || (b as any).id;
        return bId === boardId;
      });
    });
  });

  activeBoard = computed(() => {
    const project = this.project();
    if (!project || !project.activeBoardId) return null;
    const activeId =
      typeof project.activeBoardId === 'string'
        ? project.activeBoardId
        : (project.activeBoardId as any)._id?.toString() || (project.activeBoardId as any).id;
    return (
      this.projectBoards().find((b) => {
        const boardId = typeof b._id === 'string' ? b._id : String(b._id);
        return boardId === activeId;
      }) || null
    );
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.projectId.set(params['id']);
      this.loadProject();
      this.loadBoards();
    });

    // Listen for project updates
    this.wsService.onProjectUpdate().subscribe((update) => {
      if (update.project._id === this.projectId()) {
        if (update.action === 'update') {
          this.loadProject();
        } else if (update.action === 'delete') {
          this.router.navigate(['/projects']);
        }
      }
    });

    // Listen for board updates
    this.wsService.onBoardUpdate().subscribe((update) => {
      if (update.action === 'create' || update.action === 'update') {
        this.loadBoards();
        this.loadProject();
      } else if (update.action === 'delete') {
        this.loadBoards();
        this.loadProject();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadProject(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading.set(true);
    this.projectsService.getById(this.projectId()).subscribe({
      next: (project) => {
        this.project.set(project);
        this.isLoading.set(false);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Session expired. Please log in again.');
          this.authService.logout();
        } else if (err.status === 404) {
          this.errorMessage.set('Project not found.');
          setTimeout(() => this.router.navigate(['/projects']), 2000);
        } else {
          this.errorMessage.set(err.error?.message || 'Failed to load project. Please try again.');
        }
      },
    });
  }

  loadBoards(): void {
    this.boardsService.getAll().subscribe({
      next: (boards) => {
        this.allBoards.set(boards);
      },
      error: (err) => {
        console.error('Failed to load boards:', err);
      },
    });
  }

  filteredProjectBoards() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.projectBoards();
    return this.projectBoards().filter(
      (board) =>
        board.name.toLowerCase().includes(term) || board.description?.toLowerCase().includes(term)
    );
  }

  createBoard(): void {
    this.showCreateDialog.set(true);
  }

  confirmCreateBoard(name: string): void {
    if (name && name.trim()) {
      this.isCreating.set(true);
      this.errorMessage.set('');
      this.showCreateDialog.set(false);

      this.boardsService.create({ name: name.trim() }).subscribe({
        next: (board) => {
          this.isCreating.set(false);
          // Add board to project
          this.projectsService.addBoardToProject(this.projectId(), board._id).subscribe({
            next: (project) => {
              this.project.set(project);
              this.loadBoards();
            },
            error: (err) => {
              console.error('Failed to add board to project:', err);
            },
          });
        },
        error: (err) => {
          this.isCreating.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to create board. Please try again.');
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  cancelCreateBoard(): void {
    this.showCreateDialog.set(false);
  }

  addExistingBoard(): void {
    this.showAddBoardDialog.set(true);
  }

  confirmAddBoard(boardId: string): void {
    if (boardId) {
      this.projectsService.addBoardToProject(this.projectId(), boardId).subscribe({
        next: (project) => {
          this.project.set(project);
          this.loadBoards();
          this.showAddBoardDialog.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Failed to add board to project. Please try again.'
          );
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  getAvailableBoardOptions() {
    const project = this.project();
    if (!project) return [];
    const projectBoardIds = project.boards.map((b) => {
      const bId = typeof b === 'string' ? b : (b as any)._id?.toString() || (b as any).id;
      return bId;
    });
    return this.allBoards()
      .filter((board) => {
        const boardId = typeof board._id === 'string' ? board._id : String(board._id);
        const projectIdStr = typeof project._id === 'string' ? project._id : String(project._id);
        // Include boards that don't belong to any project, or already belong to this project
        return (
          (!board.projectId || String(board.projectId) === projectIdStr) &&
          !projectBoardIds.includes(boardId)
        );
      })
      .map((board) => ({
        value: typeof board._id === 'string' ? board._id : String(board._id),
        label: board.name,
      }));
  }

  cancelAddBoard(): void {
    this.showAddBoardDialog.set(false);
  }

  removeBoardFromProject(boardId: string): void {
    this.projectsService.removeBoardFromProject(this.projectId(), boardId).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loadBoards();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Failed to remove board from project. Please try again.'
        );
        setTimeout(() => this.errorMessage.set(''), 5000);
      },
    });
  }

  setActiveBoard(boardId: string): void {
    this.projectsService.update(this.projectId(), { activeBoardId: boardId }).subscribe({
      next: (project) => {
        this.project.set(project);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Failed to set active board. Please try again.'
        );
        setTimeout(() => this.errorMessage.set(''), 5000);
      },
    });
  }

  navigateToBoard(boardId: string): void {
    this.router.navigate(['/projects', this.projectId(), 'boards', boardId]);
  }

  getActiveBoardName(): string {
    const board = this.activeBoard();
    if (!board) return '';
    return (board as any)?.name || '';
  }

  getActiveBoardDescription(): string {
    const board = this.activeBoard();
    if (!board) return '';
    return (board as any)?.description || '';
  }

  getActiveBoardCreatedAt(): string {
    const board = this.activeBoard();
    if (!board) return '';
    return (board as any)?.createdAt || '';
  }

  getActiveBoardColor(): string {
    const board = this.activeBoard();
    if (!board) return '#d782ba';
    return (board as any)?.color || '#d782ba';
  }

  getActiveBoardId(): string {
    const board = this.activeBoard();
    if (!board) return '';
    return typeof board._id === 'string' ? board._id : String(board._id);
  }
}
