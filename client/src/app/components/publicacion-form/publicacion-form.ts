import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-publicacion-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-form.html',
  styleUrls: ['./publicacion-form.css']
})
export class PublicacionFormComponent {
  @Output() crear = new EventEmitter<{ titulo: string; descripcion: string; imagen?: File | null }>();

  titulo = '';
  descripcion = '';
  imagen: File | null = null;

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.imagen = input.files?.[0] ?? null;
  }

  submit() {
    if (!this.titulo.trim() || !this.descripcion.trim()) return;
    this.crear.emit({ titulo: this.titulo.trim(), descripcion: this.descripcion.trim(), imagen: this.imagen ?? undefined });
    this.titulo = ''; this.descripcion = ''; this.imagen = null;
    const input = document.getElementById('fileImagen') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  
}
