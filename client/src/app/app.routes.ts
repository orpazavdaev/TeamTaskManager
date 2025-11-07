import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    canActivate: [loginGuard],
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects-list/projects-list.component').then(
        (m) => m.ProjectsListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:projectId/boards/:id',
    loadComponent: () =>
      import('./features/boards/board-detail/board-detail.component').then(
        (m) => m.BoardDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'boards',
    loadChildren: () => import('./features/boards/boards.routes').then((m) => m.boardsRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/projects',
    pathMatch: 'full',
  },
];
