import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publicacion } from '../../service/publicaciones.service';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './publicacion-card.html',
  styleUrls: ['./publicacion-card.css'],
})
export class PublicacionCardComponent {
  @Input({ required: true }) pub!: Publicacion;
  @Input() esPropia = false;
  @Input() meCorreo: string | null = null;

  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() comentar = new EventEmitter<{ id: string; texto: string }>();

  comentarAbierto = signal(false);
  textoComentario = '';

  get dioLike(): boolean {
    return !!this.meCorreo && this.pub.likedBy?.includes(this.meCorreo);
  }

  toggleComentar() {
    this.comentarAbierto.update((v) => !v);
  }
  enviarComentario() {
    const t = this.textoComentario.trim();
    if (!t) return;
    this.comentar.emit({ id: this.pub._id, texto: t });
    this.textoComentario = '';
  }

  avatarIniciales(nombre?: string, apellido?: string) {
    const n = (nombre ?? '').trim();
    const a = (apellido ?? '').trim();
    return (n[0] ?? '').toUpperCase() + (a[0] ?? '').toUpperCase();
  }

}
