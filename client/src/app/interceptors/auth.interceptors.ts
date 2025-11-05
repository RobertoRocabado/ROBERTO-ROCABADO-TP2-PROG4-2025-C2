import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

const AUTH_PATHS = ['/auth/login', '/auth/registro', '/auth/autorizar', '/auth/refrescar'];

let refreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((err: HttpErrorResponse) => {
      const url = req.url || '';
      if (AUTH_PATHS.some(p => url.includes(p))) {
        return throwError(() => err);
      }

      const hasTokenCookie =
        isBrowser &&
        document.cookie
          .split(';')
          .some(c => c.trim().startsWith('token='));

      if (err.status === 401 && !refreshing && hasTokenCookie) {
        refreshing = true;

        return auth.refrescar().pipe(
          switchMap(() => {
            refreshing = false;
            return next(req.clone({ withCredentials: true }));
          }),
          catchError(e => {
            refreshing = false;
            auth.logout().subscribe({ error: () => {} });
            if (isBrowser) router.navigateByUrl('/login');
            return throwError(() => e);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
