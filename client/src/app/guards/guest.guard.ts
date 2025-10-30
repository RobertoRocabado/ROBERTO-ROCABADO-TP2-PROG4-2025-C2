import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.usuario) {
      return of(this.router.createUrlTree(['/publicaciones']));
    }

    return this.auth.autorizar().pipe(
      map(() => this.auth.usuario ? this.router.createUrlTree(['/publicaciones']) : true),
      catchError(() => of(true))
    );
  }
}