import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuarios } from '../../components/usuarios/usuarios';
import { Estadisticas } from '../../components/estadisticas/estadisticas';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Usuarios, Estadisticas],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  pestanaSeleccionada: 'usuarios' | 'estadisticas' = 'usuarios';

  seleccionarPestana(pestana: 'usuarios' | 'estadisticas'): void {
    this.pestanaSeleccionada = pestana;
  }
}
