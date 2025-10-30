import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

const AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/registro',
  '/api/auth/autorizar',
  '/api/auth/refrescar'
];

let refreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((err: HttpErrorResponse) => {
      if (AUTH_PATHS.some(p => req.url.includes(p))) {
        return throwError(() => err);
      }


      const hasTokenCookie = document.cookie.split(';').some(c => c.trim().startsWith('token='));

      if (err.status === 401 && !refreshing && hasTokenCookie) {
        refreshing = true;
        return auth.refrescar().pipe(
          switchMap(() => {
            refreshing = false;
            return next(req.clone({ withCredentials: true }));
          }),
          catchError(e => {
            refreshing = false;
            auth.logout();
            router.navigateByUrl('/login');
            return throwError(() => e);
          })
        );
      }

      return throwError(() => err);
    })
  );
};