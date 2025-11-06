import { Component, computed, signal, OnInit, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesApi, Publicacion, Orden, Page } from '../../service/publicaciones.service';
import { PublicacionFormComponent } from '../../components/publicacion-form/publicacion-form';
import { PublicacionCardComponent } from '../../components/publicacion-card/publicacion-card';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-publicaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicacionFormComponent, PublicacionCardComponent],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class Publicaciones implements OnInit {
  private api = inject(PublicacionesApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // señales tipadas
  publicaciones: WritableSignal<Publicacion[]> = signal<Publicacion[]>([]);
  total = signal<number>(0);
  limit = signal<number>(10);
  page = signal<number>(1);
  sortBy = signal<Orden>('fecha');

  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));
  pageNumbers = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));

  trackPub = (index: number, p: Publicacion) => {
    if (p?._id) return String(p._id);
    const created = p?.createdAt ? new Date(p.createdAt).getTime() : '';
    const correo = p?.usuario?.correo || '';
    return (created && correo) ? `${created}-${correo}` : `idx-${index}`;
  };

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    this.sortBy.set((q.get('sortBy') as Orden) ?? 'fecha');
    this.page.set(Math.max(1, +(q.get('page') ?? 1)));
    this.limit.set(Math.max(1, +(q.get('limit') ?? 10)));

    this.route.queryParamMap.subscribe(map => {
      const s = (map.get('sortBy') as Orden) ?? this.sortBy();
      const p = Math.max(1, +(map.get('page') ?? this.page()));
      const l = Math.max(1, +(map.get('limit') ?? this.limit()));
      let changed = false;
      if (s !== this.sortBy()) { this.sortBy.set(s); changed = true; }
      if (p !== this.page())   { this.page.set(p);  changed = true; }
      if (l !== this.limit())  { this.limit.set(l); changed = true; }
      if (changed) this.cargar();
    });

    this.cargar();
  }

  cargar() {
    this.api.listar({
      sortBy: this.sortBy(),
      page: this.page(),
      limit: this.limit(),
    }).subscribe({
      next: (r: Page<Publicacion>) => {
        this.publicaciones.set(r.items as Publicacion[]);
        this.total.set(r.total);
      },
      error: (err) => console.error('Error listando publicaciones', err),
    });
  }

  private pushUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: this.sortBy(),
        page: this.page(),
        limit: this.limit(),
      },
      replaceUrl: true,
      queryParamsHandling: ''
    });
  }

  go(p: number) {
    const max = Math.max(1, this.pages());
    const clamped = Math.min(Math.max(1, p), max);
    if (clamped === this.page()) return;
    this.page.set(clamped);
    this.pushUrl();
    this.cargar();
  }

  cambiarOrden(v: Orden) {
    if (v === this.sortBy()) return;
    this.sortBy.set(v);
    this.page.set(1);
    this.pushUrl();
    this.cargar();
  }

  cambiarLimit(nuevo: number) {
    if (nuevo === this.limit()) return;
    this.limit.set(nuevo);
    this.page.set(1);
    this.pushUrl();
    this.cargar();
  }

  crearPub = (d: { titulo: string; descripcion: string; imagen?: File | null }) => {
    this.api.crear(d).subscribe({
      next: (pub: Publicacion) => {
        if (this.sortBy() === 'fecha' && this.page() === 1) {
          this.publicaciones.update((list: Publicacion[]) => [pub, ...list]);
          this.total.set(this.total() + 1);
        } else {
          this.cargar();
        }
      },
      error: (err) => console.error('Error creando publicación', err),
    });
  };

  like(id: string) {
    (this.api.like(id) as unknown as Observable<Publicacion | { alreadyLiked: true }>)
      .subscribe(
        (res) => {
          if ((res as any)?.alreadyLiked) return;
          const pub = res as Publicacion;
          this.publicaciones.update((list: Publicacion[]) =>
            list.map(p => p._id === id ? pub : p)
          );
        },
        (err) => console.error('Error like', err)
      );
  }

  unlike(id: string) {
    (this.api.unlike(id) as unknown as Observable<Publicacion | { notLiked: true }>)
      .subscribe(
        (res) => {
          if ((res as any)?.notLiked) return;
          const pub = res as Publicacion;
          this.publicaciones.update((list: Publicacion[]) =>
            list.map(p => p._id === id ? pub : p)
          );
        },
        (err) => console.error('Error unlike', err)
      );
  }

  comentar(e: { id: string; texto: string }) {
    (this.api.comentar(e.id, e.texto) as unknown as Observable<Publicacion>)
      .subscribe(
        (pub) => {
          this.publicaciones.update((list: Publicacion[]) =>
            list.map(p => p._id === pub._id ? pub : p)
          );
        },
        (err) => console.error('Error comentar', err)
      );
  }

  eliminar(id: string) {
    this.api.eliminar(id).subscribe({
      next: (r: { ok: boolean }) => {
        if (!r?.ok) return;
        this.publicaciones.update((list: Publicacion[]) =>
          list.filter(p => p._id !== id)
        );
        this.total.set(Math.max(0, this.total() - 1));
        if (this.publicaciones().length === 0 && this.page() > 1) {
          this.go(this.page() - 1);
        }
      },
      error: (err) => console.error('Error eliminar', err),
    });
  }
}
