import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { Usuario } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<Usuario[]>(`/usuarios`, { withCredentials: true });
  }

  create(dto: Partial<Usuario> & { password: string }) {
    return this.http.post<Usuario>(`/usuarios`, dto, { withCredentials: true });
  }

  update(id: string, dto: Partial<Usuario> & { password?: string }) {
    return this.http.patch<Usuario>(`/usuarios/${id}`, dto, { withCredentials: true });
  }

  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`/usuarios/${id}`, { withCredentials: true });
  }

  habilitar(id: string) {
    return this.http.post<Usuario>(`/usuarios/${id}/habilitar`, {}, { withCredentials: true });
  }
}