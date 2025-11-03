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
        const token = authService.getToken();
        // Only logout if we have a token (meaning it's expired/invalid)
        // If no token, don't logout as user might be in the process of logging in
        if (token) {
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};
