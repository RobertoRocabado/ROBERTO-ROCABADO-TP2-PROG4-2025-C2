import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';                 
import { Router } from '@angular/router';       

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  rol: 'usuario' | 'administrador';
  habilitado: boolean;
  descripcion?: string;
  fechaNacimiento?: string;
  fotoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: Usuario | null = null;
  private base = `${environment.apiBase}/auth`;

  private storageKeyUser = 'app:user';

  // para el spinner sprint #3
  private validado = false;
  get estaValidado(): boolean { return this.validado; }
  //

  private TIEMPO_SESION = 30  * 60 * 1000;   
  private ADVERTENCIA = 25 * 60 * 1000;   
  private sessionWarningTimer: any = null;    
  private sessionExpiryTimer: any = null;     

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,                                    
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.storageKeyUser);
      if (raw) {
        try { this.user = JSON.parse(raw) as Usuario; } catch {}
      }
    }
  }

  private persistUser(u: Usuario | null) {
    this.user = u;
    if (isPlatformBrowser(this.platformId)) {
      if (u) localStorage.setItem(this.storageKeyUser, JSON.stringify(u));
      else localStorage.removeItem(this.storageKeyUser);
    }
  }

  private startSessionTimers() {                                
    if (!isPlatformBrowser(this.platformId)) return;

    this.clearSessionTimers();

    this.sessionWarningTimer = setTimeout(async () => {
      const result = await Swal.fire({
        title: 'Tu sesión está por expirar',
        text: 'Quedan 5 minutos de sesión. ¿Querés extenderla?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, extender sesión',
        cancelButtonText: 'No',
        allowOutsideClick: false,
        allowEscapeKey: false,
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        this.refrescar().subscribe({
          next: () => {
            Swal.fire({
              title: 'Sesión extendida',
              text: 'Tu sesión se extendió 15 minutos más.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      }
    }, this.ADVERTENCIA );

    this.sessionExpiryTimer = setTimeout(() => {
      this.logout().subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: () => this.router.navigateByUrl('/login'),
      });
    }, this.TIEMPO_SESION);
  }

  private clearSessionTimers() {                               
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
      this.sessionWarningTimer = null;
    }
    if (this.sessionExpiryTimer) {
      clearTimeout(this.sessionExpiryTimer);
      this.sessionExpiryTimer = null;
    }
  }

  // ============================

  registro(payload: FormData): Observable<any> {
    return this.http.post(`${this.base}/registro`, payload, {
      withCredentials: environment.withCredentials,
    });
  }

  login(login: string, password: string) {
    //Flag 
    this.validado = false;
    return this.http
      .post<{ user: Usuario }>(
        `${this.base}/login`,
        { login, password },
        { withCredentials: environment.withCredentials }
      )
      .pipe(
        tap((res) => {
          this.persistUser(res.user);
          this.startSessionTimers();                             
        })
      );
  }

  autorizar() {
    return this.http
      .get<{ ok: boolean; user?: Usuario }>(`${this.base}/me`, {
        withCredentials: environment.withCredentials,
      })
      .pipe(
        tap((res) => {
          if (res.ok && res.user) {
            this.setUsuario(res.user);
            this.startSessionTimers();                           
          }
          this.validado = true;
        })
      );
  }

  refrescar() {
    return this.http.post(
      `${this.base}/refrescar`,
      {},
      { withCredentials: environment.withCredentials }
    ).pipe(
      tap(() => {
        this.startSessionTimers();                               
      })
    );
  }

  logout() {
    return this.http
      .post(`${this.base}/logout`, {}, { withCredentials: environment.withCredentials })
      .pipe(
        tap(() => {
          this.persistUser(null);
          this.clearSessionTimers();                             
        })
      );
  }

  get usuario() {
    return this.user;
  }
  setUsuario(u: Usuario | null) {
    this.persistUser(u);
  }
  isAdmin(): boolean {
    return this.user?.rol === 'administrador';
  }
}
