import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { Usuario } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<Usuario[]>(`/api/usuarios`, { withCredentials: true });
  }

  create(dto: Partial<Usuario> & { password: string }) {
    return this.http.post<Usuario>(`/api/usuarios`, dto, { withCredentials: true });
  }

  update(id: string, dto: Partial<Usuario> & { password?: string }) {
    return this.http.patch<Usuario>(`/api/usuarios/${id}`, dto, { withCredentials: true });
  }

  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`api/usuarios/${id}`, { withCredentials: true });
  }

  habilitar(id: string) {
    return this.http.post<Usuario>(`/api/usuarios/${id}/habilitar`, {}, { withCredentials: true });
  }
}