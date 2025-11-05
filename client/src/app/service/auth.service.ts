import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments';
import { isPlatformBrowser } from '@angular/common';

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
  private base = `${environment.apiBase}${environment.apiPrefix}/auth`;

  private storageKeyUser = 'app:user';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.storageKeyUser);
      if (raw) {
        try {
          this.user = JSON.parse(raw) as Usuario;
        } catch {}
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

  registro(payload: FormData): Observable<any> {
    return this.http.post(`${this.base}/registro`, payload, { withCredentials: true });
  }

  login(login: string, password: string) {
    return this.http
      .post<{ user: Usuario }>(`${this.base}/login`, { login, password }, { withCredentials: true })
      .pipe(tap((res) => this.persistUser(res.user)));
  }

  autorizar() {
    return this.http
      .get<{ ok: boolean; user?: Usuario }>(`${this.base}/me`, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res.ok && res.user) {
            this.setUsuario(res.user);
          }
        })
      );
  }

  refrescar() {
    return this.http.post(`${this.base}/refrescar`, {}, { withCredentials: true });
  }

  logout() {
    return this.http
      .post(`${this.base}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.persistUser(null)));
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
