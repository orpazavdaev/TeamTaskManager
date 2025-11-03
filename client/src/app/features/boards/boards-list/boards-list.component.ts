import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BoardsService } from '../../../core/services/boards.service';
import { Board } from '../../../core/models/board.model';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-boards-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boards-list.component.html',
  styleUrl: './boards-list.component.css',
})
export class BoardsListComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private router = inject(Router);
  private wsService = inject(WebSocketService);

  boards = signal<Board[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  isCreating = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadBoards();
    this.wsService.connect();

    // Listen for board updates
    this.wsService.onBoardUpdate().subscribe((update) => {
      if (update.action === 'delete') {
        this.boards.update((boards) => boards.filter((b) => b._id !== update.board._id));
      } else if (update.action === 'create') {
        this.boards.update((boards) => [...boards, update.board]);
      } else if (update.action === 'update') {
        this.boards.update((boards) =>
          boards.map((b) => (b._id === update.board._id ? update.board : b))
        );
      }
    });
  }

  loadBoards(): void {
    this.isLoading.set(true);
    this.boardsService.getAll().subscribe({
      next: (boards) => {
        this.boards.set(boards);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  filteredBoards() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.boards();
    return this.boards().filter(
      (board) =>
        board.name.toLowerCase().includes(term) || board.description?.toLowerCase().includes(term)
    );
  }

  createBoard(): void {
    const name = prompt('Enter board name:');
    if (name && name.trim()) {
      this.isCreating.set(true);
      this.errorMessage.set('');

      this.boardsService.create({ name: name.trim() }).subscribe({
        next: (board) => {
          this.isCreating.set(false);
          this.boards.update((boards) => [...boards, board]);
          this.router.navigate(['/boards', board._id]);
        },
        error: (err) => {
          this.isCreating.set(false);
          console.error('Error creating board:', err);
          this.errorMessage.set(err.error?.message || 'Failed to create board. Please try again.');
          // Clear error message after 5 seconds
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
      });
    }
  }
}
