import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth.service';
import { PublicacionesApi, Publicacion, Orden, Page,} from '../../service/publicaciones.service';
import { PublicacionCardComponent } from '../../components/publicacion-card/publicacion-card';
import { PublicacionFormComponent } from '../../components/publicacion-form/publicacion-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicacionCardComponent, PublicacionFormComponent],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css'],
})
export class Publicaciones {
  cargando = signal(false);
  sortBy = signal<Orden>('fecha');
  page = signal(1);

  private readonly LIMIT = 6;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);

  meCorreo = computed(() => this.auth.usuario?.correo ?? null);
  esAdmin = computed(() => this.auth.isAdmin());

  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.LIMIT)));
  pageNumbers = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));

  constructor(
    private api: PublicacionesApi,
    private auth: AuthService,
    private router: Router 
  ) {
    this.cargar();

    const nombre = sessionStorage.getItem('loginOk');
  if (nombre) {
    sessionStorage.removeItem('loginOk');

    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: `Bienvenido ${nombre}!`,
        timer: 1500,
        showConfirmButton: false,
      });
    }, 300); 
    }
  }

  abrir(id: string) {                       
    this.router.navigate(['/publicaciones', id]);
  }

  async cargar() {
    this.cargando.set(true);
    try {
      const res = await this.api
        .listar({ sortBy: this.sortBy(), page: this.page(), limit: this.LIMIT })
        .toPromise();
      const page = (res as Page<Publicacion>) ?? { items: [], total: 0, offset: 0, limit: this.LIMIT };
      this.publicaciones.set(page.items || []);
      this.total.set(page.total || 0);
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarOrden(o: Orden) {
    if (this.sortBy() === o) return;
    this.sortBy.set(o);
    this.page.set(1);
    this.cargar();
  }

  go(n: number) {
    if (n < 1 || n > this.pages()) return;
    this.page.set(n);
    this.cargar();
  }

  trackPub = (_: number, p: Publicacion) => p._id;

  esPropia(pub: Publicacion): boolean {
    const me = this.meCorreo();
    return (!!me && pub.usuario?.correo === me) || this.esAdmin();
  }

  async crearPub(payload: { titulo: string; descripcion: string; imagen?: File | null }) {
    try {
      await this.api.crear(payload).toPromise();
      this.page.set(1); 
      this.cargar();
    } catch {
      Swal.fire('Error', 'No se pudo crear la publicación', 'error');
    }
  }

  async like(id: string) {
    const list = [...this.publicaciones()];
    const i = list.findIndex((p) => p._id === id);
    if (i === -1) return;
    const me = this.meCorreo();
    if (!me) return;

    if (list[i].likedBy?.includes(me)) return;

    const prev = { ...list[i] };
    list[i].likedBy = [...(list[i].likedBy ?? []), me];
    list[i].likesCount = (list[i].likesCount ?? 0) + 1;
    this.publicaciones.set(list);

    try {
      const updated = await this.api.like(id).toPromise();
      if ((updated as any)?.alreadyLiked) {
        list[i] = prev;
      } else {
        list[i] = { ...list[i], ...(updated as Publicacion) };
      }
      this.publicaciones.set(list);
    } catch {
      list[i] = prev;
      this.publicaciones.set(list);
    }
  }

  async unlike(id: string) {
    const list = [...this.publicaciones()];
    const i = list.findIndex((p) => p._id === id);
    if (i === -1) return;
    const me = this.meCorreo();
    if (!me) return;

    if (!list[i].likedBy?.includes(me)) return;

    const prev = { ...list[i] };
    list[i].likedBy = (list[i].likedBy ?? []).filter((x) => x !== me);
    list[i].likesCount = Math.max(0, (list[i].likesCount ?? 0) - 1);
    this.publicaciones.set(list);

    try {
      const updated = await this.api.unlike(id).toPromise();
      if ((updated as any)?.notLiked) {
        list[i] = prev;
      } else {
        list[i] = { ...list[i], ...(updated as Publicacion) };
      }
      this.publicaciones.set(list);
    } catch {
      list[i] = prev;
      this.publicaciones.set(list);
    }
  }

  async comentar(payload: { id: string; texto: string }) {
    try {
      const updated = (await this.api.comentar(payload.id, payload.texto).toPromise()) as Publicacion;
      const list = [...this.publicaciones()];
      const i = list.findIndex((p) => p._id === payload.id);
      if (i !== -1) {
        list[i] = { ...list[i], ...updated };
        this.publicaciones.set(list);
      }
    } catch {
      Swal.fire('Error', 'No se pudo comentar', 'error');
    }
  }

  async eliminar(id: string) {
    const confirm = await Swal.fire({
      title: '¿Eliminar publicación?',
      text: 'Solo el administrador podra deshacer esta accion.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b1acac',
    });

    if (!confirm.isConfirmed) return;

    const prevList = [...this.publicaciones()];
    const newList = prevList.filter((p) => p._id !== id);
    this.publicaciones.set(newList);
    this.total.update((t) => Math.max(0, t - 1));

    try {
      await this.api.eliminar(id).toPromise();
      if (this.publicaciones().length === 0 && this.page() > 1) {
        this.go(this.page() - 1);
      }
      Swal.fire('Eliminada', 'La publicación fue eliminada', 'success');
    } catch {
      this.publicaciones.set(prevList);
      this.total.update((t) => t + 1);
      Swal.fire('Error', 'No se pudo eliminar la publicación', 'error');
    }
  }
}
