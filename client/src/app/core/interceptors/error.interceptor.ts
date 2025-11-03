import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401) {
        console.warn('Unauthorized access - token expired or invalid');
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        });
      }

      // Handle 403 Forbidden - no permission
      if (error.status === 403) {
        console.warn('Forbidden - insufficient permissions');
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};
