import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class UsuariosService {
//   constructor(private http: HttpClient) {}

//   findAll() {
//     return this.http.get<Usuario[]>(`/usuarios`, { withCredentials: true });
//   }

//   create(dto: Partial<Usuario> & { password: string }) {
//     return this.http.post<Usuario>(`/usuarios`, dto, { withCredentials: true });
//   }

//   update(id: string, dto: Partial<Usuario> & { password?: string }) {
//     return this.http.patch<Usuario>(`/usuarios/${id}`, dto, { withCredentials: true });
//   }

//   deshabilitar(id: string) {
//     return this.http.delete<Usuario>(`/usuarios/${id}`, { withCredentials: true });
//   }

//   habilitar(id: string) {
//     return this.http.post<Usuario>(`/usuarios/${id}/habilitar`, {}, { withCredentials: true });
//   }
// }

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private api = 'http://localhost:3000'; // puerto donde corre Nest

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
