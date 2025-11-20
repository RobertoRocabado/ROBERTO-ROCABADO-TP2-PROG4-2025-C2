import { Pipe, PipeTransform } from '@angular/core';
import { Comentario, Publicacion } from '../service/publicaciones.service';

@Pipe({
  name: 'formatoFecha',
  standalone: true,
})
export class FormatoFechaPipe implements PipeTransform {

  private esComentario(item: any): item is Comentario {
    return item && typeof item.texto === 'string' && !!item.autor;
  }

  private esPublicacion(item: any): item is Publicacion {
    return item && typeof item.titulo === 'string' && !!item.usuario;
  }

  transform(item: Comentario | Publicacion | null | undefined): string {
    if (!item) return '';

    let fechaRaw: any;

    if (this.esComentario(item)) {
      fechaRaw = item.modificado && item.updatedAt
        ? item.updatedAt
        : item.createdAt;
    }

    else if (this.esPublicacion(item)) {
      fechaRaw = item.createdAt;
    }

    else {
      return '';
    }

    const fecha = new Date(fechaRaw);

    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return fecha.toLocaleString('en-US', opciones);
  }
}
