import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from './auth.service';
import { environment } from '../../environments';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  // private api = 'environment.apiBase}'; 
  private api = `${environment.apiBase}`;

  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<Usuario[]>(`${this.api}/usuarios`, {
      withCredentials: true,
    });
  }

  create(dto: Partial<Usuario> & { password: string }) {
    return this.http.post<Usuario>(`${this.api}/usuarios`, dto, {
      withCredentials: true,
    });
  }

  update(id: string, dto: Partial<Usuario> & { password?: string }) {
    return this.http.patch<Usuario>(`${this.api}/usuarios/${id}`, dto, {
      withCredentials: true,
    });
  }

  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`${this.api}/usuarios/${id}`, {
      withCredentials: true,
    });
  }

  habilitar(id: string) {
    return this.http.post<Usuario>(`${this.api}/usuarios/${id}/habilitar`, {}, {
      withCredentials: true,
    });
  }
}
