import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    canActivate: [loginGuard],
  },
  {
    path: 'boards',
    loadChildren: () => import('./features/boards/boards.routes').then((m) => m.boardsRoutes),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/boards',
    pathMatch: 'full',
  },
];
