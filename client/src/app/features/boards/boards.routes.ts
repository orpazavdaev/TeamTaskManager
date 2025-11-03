import { Routes } from '@angular/router';
import { BoardsListComponent } from './boards-list/boards-list.component';

export const boardsRoutes: Routes = [
  {
    path: '',
    component: BoardsListComponent,
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./board-detail/board-detail.component').then((m) => m.BoardDetailComponent),
  },
];

