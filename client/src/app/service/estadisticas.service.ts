import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private apiUrl = `${environment.apiBase}/publicaciones/estadisticas`;

  constructor(private http: HttpClient) {}

  private buildParams(
    fechaInicio?: string,
    fechaFin?: string,
  ): HttpParams {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return params;
  }

  publicacionesPorUsuario(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/publicaciones-por-usuario`,
      {
        params: this.buildParams(fechaInicio, fechaFin),
      },
    );
  }

  comentariosPorFecha(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/comentarios-por-fecha`,
      {
        params: this.buildParams(fechaInicio, fechaFin),
      },
    );
  }

  comentariosPorPublicacion(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/comentarios-por-publicacion`,
      {
        params: this.buildParams(fechaInicio, fechaFin),
      },
    );
  }
}
