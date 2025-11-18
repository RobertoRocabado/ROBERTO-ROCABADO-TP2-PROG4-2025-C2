import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.usuario && this.auth.estaValidado) {
      return of(true);
    }

    return this.auth.autorizar().pipe(
      map(() => {
        if (this.auth.usuario) {
          return true;
        }
        return this.router.createUrlTree(['/login']);
      }),
      catchError(() => {
        this.auth.limpiarSesionLocal();
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
