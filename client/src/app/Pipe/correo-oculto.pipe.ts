import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'correoOculto',
  standalone: true,
})
export class CorreoOcultoPipe implements PipeTransform {

  transform(correo: string | null | undefined): string {
    if (!correo) return '';

    const partes = correo.split('@');
    if (partes.length !== 2) {
      return correo;
    }

    const nombre = partes[0];
    const dominio = partes[1];

    if (nombre.length <= 2) {
      return `***@${dominio}`;
    }

    const visibles = nombre.slice(0, 2);
    const ocultas = '*'.repeat(Math.max(3, nombre.length - 2));

    return `${visibles}${ocultas}@${dominio}`;
  }
}
