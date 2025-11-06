import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments';

// —— Tipos públicos (exportados) ——
export type Orden = 'fecha' | 'likes';

export interface Autor {
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  fotoUrl?: string | null;
}

export interface Comentario {
  _id: string;
  autor: Autor;
  texto: string;
  createdAt: string;
}

export interface Publicacion {
  _id: string;
  usuario: Autor;
  titulo: string;
  descripcion: string;
  imagenUrl?: string | null;
  habilitado: boolean;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
  comentarios: Comentario[];
}

export interface Page<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
  // private base = 'http://localhost:3000/publicaciones';
  private base = `${environment.apiBase}/publicaciones`;

  constructor(private http: HttpClient) {}

  // listar(opts: {
  //   sortBy?: Orden;
  //   page?: number;
  //   limit?: number;
  //   userCorreo?: string;
  // }): Observable<Page<Publicacion>> {
  //   let params = new HttpParams();
  //   if (opts.sortBy) params = params.set('sortBy', opts.sortBy);
  //   if (opts.page != null) params = params.set('page', String(opts.page));
  //   if (opts.limit != null) params = params.set('limit', String(opts.limit));
  //   if (opts.userCorreo) params = params.set('userCorreo', opts.userCorreo);

  //   return this.http.get<Page<Publicacion>>(this.base, {
  //     params,
  //     withCredentials: true,
  //   });
  // }

  // crear(data: {
  //   titulo: string;
  //   descripcion: string;
  //   imagen?: File | null;
  // }): Observable<Publicacion> {
  //   const fd = new FormData();
  //   fd.append('titulo', data.titulo);
  //   fd.append('descripcion', data.descripcion);
  //   if (data.imagen) fd.append('imagen', data.imagen);
  //   return this.http.post<Publicacion>(this.base, fd, { withCredentials: true });
  // }

  // like(id: string): Observable<Publicacion | { alreadyLiked: true }> {
  //   return this.http.post<Publicacion | { alreadyLiked: true }>(
  //     `${this.base}/${id}/likes`,
  //     {},
  //     { withCredentials: true }
  //   );
  // }

  // unlike(id: string): Observable<Publicacion | { notLiked: true }> {
  //   return this.http.delete<Publicacion | { notLiked: true }>(`${this.base}/${id}/likes`, {
  //     withCredentials: true,
  //   });
  // }

  // eliminar(id: string): Observable<{ ok: boolean }> {
  //   return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`, { withCredentials: true });
  // }

  // comentar(id: string, texto: string): Observable<Publicacion> {
  //   return this.http.post<Publicacion>(
  //     `${this.base}/${id}/comentarios`,
  //     { texto },
  //     { withCredentials: true }
  //   );
  // }
  listar(opts: { sortBy?: Orden; page?: number; limit?: number; userCorreo?: string }) {
    let params = new HttpParams();
    if (opts.sortBy) params = params.set('sortBy', opts.sortBy);
    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.userCorreo) params = params.set('userCorreo', opts.userCorreo);

    return this.http.get<Page<Publicacion>>(this.base, {
      params,
      withCredentials: environment.withCredentials,
    });
  }

  crear(data: { titulo: string; descripcion: string; imagen?: File | null }) {
    const fd = new FormData();
    fd.append('titulo', data.titulo);
    fd.append('descripcion', data.descripcion);
    if (data.imagen) fd.append('imagen', data.imagen);
    return this.http.post<Publicacion>(this.base, fd, {
      withCredentials: environment.withCredentials,
    });
  }

  like(id: string) {
    return this.http.post(
      `${this.base}/${id}/likes`,
      {},
      { withCredentials: environment.withCredentials }
    );
  }
  unlike(id: string) {
    return this.http.delete(`${this.base}/${id}/likes`, {
      withCredentials: environment.withCredentials,
    });
  }
  eliminar(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`, {
      withCredentials: environment.withCredentials,
    });
  }
  comentar(id: string, texto: string) {
    return this.http.post(
      `${this.base}/${id}/comentarios`,
      { texto },
      { withCredentials: environment.withCredentials }
    );
  }
}
