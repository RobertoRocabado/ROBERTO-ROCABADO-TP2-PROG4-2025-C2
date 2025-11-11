import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { PublicacionesApi, Publicacion, Comentario } from '../../service/publicaciones.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-publicacion-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe],
  templateUrl: './publicacion.html',
  styleUrls: ['./publicacion.css'],
})
export class PublicacionDetalle {
  cargandoPub = signal(true);
  cargandoCom = signal(false);

  pub = signal<Publicacion | null>(null);

  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  offset = signal(0);
  readonly LIMIT = 10;

  // comentar
  textoComentario = signal('');

  editId = signal<string | null>(null);
  editTexto = signal('');

  meCorreo = computed(() => this.auth.usuario?.correo ?? null);
  esAdmin = computed(() => this.auth.isAdmin());
  dioLike = computed(() => {
    const me = this.meCorreo();
    const p = this.pub();
    return !!(me && p?.likedBy?.includes(me));
  });

  constructor(
    private route: ActivatedRoute,
    private api: PublicacionesApi,
    private auth: AuthService
  ) {
    this.init();
  }

  private async init() {
    const id = this.route.snapshot.paramMap.get('id')!;
    await this.cargarPublicacion(id);
    await this.cargarComentarios(true);
  }

  get pubId() {
    return this.pub()?._id!;
  }

  async cargarPublicacion(id: string) {
    this.cargandoPub.set(true);
    try {
      const p = await firstValueFrom(this.api.getById(id));
      this.pub.set(p);
    } finally {
      this.cargandoPub.set(false);
    }
  }

  async cargarComentarios(reset = false) {
    if (!this.pub()) return;
    if (reset) {
      this.offset.set(0);
      this.comentarios.set([]);
    }

    this.cargandoCom.set(true);
    try {
      const res = await firstValueFrom(
        this.api.getComentarios(this.pubId, { offset: this.offset(), limit: this.LIMIT })
      );
      
      const actuales = this.comentarios() ?? [];
      this.comentarios.set([...actuales, ...(res.items ?? [])]);
      this.total.set(res.total ?? 0);
      this.offset.update((x) => x + this.LIMIT);
    } finally {
      this.cargandoCom.set(false);
    }
  }

  puedeEditarComentario(c: Comentario): boolean {
    return c.autor?.correo === this.meCorreo() || this.esAdmin();
  }

  async enviarComentario() {
    const t = this.textoComentario().trim();
    if (!t) return;
    const updated = await this.api.comentar(this.pubId, t).toPromise();
    const nuevo = (updated as any)?.comentarios?.slice(-1)[0] as Comentario | undefined;
    if (nuevo) {
      this.comentarios.set([nuevo, ...this.comentarios()]);
      this.total.update((n) => n + 1);
    }
    this.textoComentario.set('');
  }

  async like() {
    if (!this.pub()) return;
    const me = this.meCorreo();
    if (!me) return;

    const prev = this.pub()!;
    const next = {
      ...prev,
      likedBy: [...(prev.likedBy ?? []), me],
      likesCount: (prev.likesCount ?? 0) + 1,
    };
    this.pub.set(next);

    try {
      const resp = await this.api.like(prev._id).toPromise();
      if ((resp as any)?.alreadyLiked) this.pub.set(prev);
      else this.pub.set({ ...next, ...(resp as any) });
    } catch {
      this.pub.set(prev);
    }
  }

  async unlike() {
    if (!this.pub()) return;
    const me = this.meCorreo();
    if (!me) return;

    const prev = this.pub()!;
    const next = {
      ...prev,
      likedBy: (prev.likedBy ?? []).filter((x) => x !== me),
      likesCount: Math.max(0, (prev.likesCount ?? 0) - 1),
    };
    this.pub.set(next);

    try {
      const resp = await this.api.unlike(prev._id).toPromise();
      if ((resp as any)?.notLiked) this.pub.set(prev);
      else this.pub.set({ ...next, ...(resp as any) });
    } catch {
      this.pub.set(prev);
    }
  }

  activarEdicion(c: Comentario) {
    if (!this.puedeEditarComentario(c)) return;
    this.editId.set(c._id);
    this.editTexto.set(c.texto);
  }

  cancelarEdicion() {
    this.editId.set(null);
    this.editTexto.set('');
  }

  async guardarEdicion(c: Comentario) {
    const texto = this.editTexto().trim();
    if (!texto || texto === c.texto) {
      this.cancelarEdicion();
      return;
    }
    const actualizado = await this.api.editarComentario(this.pubId, c._id, texto).toPromise();
    const arr = this.comentarios().map((x) => (x._id === c._id ? { ...x, ...actualizado } : x));
    this.comentarios.set(arr);
    this.cancelarEdicion();
  }

  get quedanMas(): boolean {
    return this.comentarios().length < this.total();
  }
}
