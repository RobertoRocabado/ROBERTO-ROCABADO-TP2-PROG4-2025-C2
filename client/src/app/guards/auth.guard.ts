// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { AuthService } from '../service/auth.service';
// import { catchError, map, of } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   constructor(private auth: AuthService, private router: Router) {}

//   canActivate() {
//   return this.auth.autorizar().pipe(
//     map(res => !!res.ok || this.router.createUrlTree(['/login'])),
//     catchError(() => of(false)) // nunca console.error
//   );
// }
// }
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.usuario) {
      return of(true);
    }

    return this.auth.autorizar().pipe(
      map(() => this.auth.usuario ? true : this.router.createUrlTree(['/login'])),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}