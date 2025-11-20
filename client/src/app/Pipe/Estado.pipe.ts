import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado',
  standalone: true,   
})
export class Estado implements PipeTransform {
  transform(value: boolean): string {
    return value ? 'Habilitado' : 'Deshabilitado';
  }
}
