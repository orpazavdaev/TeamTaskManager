import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BoardsService } from '../../../core/services/boards.service';
import { Board } from '../../../core/models/board.model';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { InputDialogComponent } from '../../../shared/components/input-dialog/input-dialog.component';

@Component({
  selector: 'app-boards-list',
  standalone: true,
  imports: [CommonModule, RouterLink, InputDialogComponent],
  templateUrl: './boards-list.component.html',
  styleUrl: './boards-list.component.css',
})
export class BoardsListComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private router = inject(Router);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);

  myBoards = signal<Board[]>([]);
  sharedBoards = signal<Board[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  isCreating = signal(false);
  errorMessage = signal('');
  showCreateDialog = signal(false);

  ngOnInit(): void {
    // Wait a bit to ensure token is saved after login
    // Check if token exists, if not wait a bit more
    const token = this.authService.getToken();
    if (token) {
      this.loadBoards();
      this.wsService.connect();
      // Update all board colors to new pastel palette
      this.updateAllBoardColors();
    } else {
      // If no token, wait a bit more (user might be in the process of logging in)
      setTimeout(() => {
        const tokenAfterWait = this.authService.getToken();
        if (tokenAfterWait) {
          this.loadBoards();
          this.wsService.connect();
          // Update all board colors to new pastel palette
          this.updateAllBoardColors();
        } else {
          // If still no token after wait, try loading anyway (might be a timing issue)
          this.loadBoards();
        }
      }, 300);
    }

    // Listen for board updates
    this.wsService.onBoardUpdate().subscribe((update) => {
      if (update.action === 'delete') {
        this.myBoards.update((boards) => boards.filter((b) => b._id !== update.board._id));
        this.sharedBoards.update((boards) => boards.filter((b) => b._id !== update.board._id));
      } else if (update.action === 'create') {
        // New boards are always "my boards"
        this.myBoards.update((boards) => [...boards, update.board]);
      } else if (update.action === 'update') {
        this.myBoards.update((boards) =>
          boards.map((b) => (b._id === update.board._id ? update.board : b))
        );
        this.sharedBoards.update((boards) =>
          boards.map((b) => (b._id === update.board._id ? update.board : b))
        );
      }
    });
  }

  updateAllBoardColors(): void {
    // Update all existing boards with old blue colors to new pastel color
    this.boardsService.updateAllColors().subscribe({
      next: (result) => {
        if (result.modifiedCount > 0) {
          // Reload boards to get updated colors
          this.loadBoards();
        }
      },
      error: () => {
        // Silently fail - not critical
      },
    });
  }

  loadBoards(): void {
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

    // Load both my boards and shared boards
    this.boardsService.getMyBoards().subscribe({
      next: (boards) => {
        this.myBoards.set(boards);
        this.isLoading.set(false);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Session expired. Please log in again.');
          this.authService.logout();
        } else {
          this.errorMessage.set(err.error?.message || 'Failed to load boards. Please try again.');
        }
      },
    });

    this.boardsService.getSharedBoards().subscribe({
      next: (boards) => {
        this.sharedBoards.set(boards);
      },
      error: (err) => {
        // Silently fail for shared boards - not critical
        console.error('Failed to load shared boards:', err);
      },
    });
  }

  filteredMyBoards() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.myBoards();
    return this.myBoards().filter(
      (board) =>
        board.name.toLowerCase().includes(term) || board.description?.toLowerCase().includes(term)
    );
  }

  filteredSharedBoards() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.sharedBoards();
    return this.sharedBoards().filter(
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
          this.myBoards.update((boards) => [...boards, board]);
          this.router.navigate(['/boards', board._id]);
        },
        error: (err) => {
          this.isCreating.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to create board. Please try again.');
          // Clear error message after 5 seconds
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }

  cancelCreateBoard(): void {
    this.showCreateDialog.set(false);
  }
}
