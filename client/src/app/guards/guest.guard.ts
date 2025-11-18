import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.usuario && this.auth.estaValidado) {
      return of(this.router.createUrlTree(['/publicaciones']));
    }

    return this.auth.autorizar().pipe(
      map(() => {
        if (this.auth.usuario) {
          return this.router.createUrlTree(['/publicaciones']);
        }
        return true;
      }),
      catchError(() => {
        this.auth.limpiarSesionLocal();
        return of(true);
      })
    );
  }
}
