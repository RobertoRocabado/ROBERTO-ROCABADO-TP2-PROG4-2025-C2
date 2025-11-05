// import { Component, computed, signal, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { PublicacionesApi, Publicacion, Orden, Page } from '../../service/publicaciones.service';
// import { PublicacionFormComponent } from '../../components/publicacion-form/publicacion-form';
// import { PublicacionCardComponent } from '../../components/publicacion-card/publicacion-card';

// @Component({
//   selector: 'app-publicaciones-page',
//   standalone: true,
//   imports: [CommonModule, FormsModule, PublicacionFormComponent, PublicacionCardComponent],
//   templateUrl: './publicaciones.html',
//   styleUrls: ['./publicaciones.css']
// })
// export class Publicaciones implements OnInit {
//   private api = inject(PublicacionesApi);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);

//   publicaciones = signal<Publicacion[]>([]);
//   total = signal(0);
//   limit = signal(10);
//   page = signal(1);              
//   sortBy = signal<Orden>('fecha');
//   pages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));

//   ngOnInit() {
   
//       // 1) Inicializar desde la URL
//     const q = this.route.snapshot.queryParamMap;
//     this.sortBy.set((q.get('sortBy') as Orden) ?? 'fecha');
//     this.page.set(Math.max(1, +(q.get('page') ?? 1)));
//     this.limit.set(Math.max(1, +(q.get('limit') ?? 10)));

//     // 2) Reaccionar a cambios en la URL (back/forward del navegador)
//     this.route.queryParamMap.subscribe(map => {
//       const s = (map.get('sortBy') as Orden) ?? this.sortBy();
//       const p = Math.max(1, +(map.get('page') ?? this.page()));
//       const l = Math.max(1, +(map.get('limit') ?? this.limit()));
//       // Evitar bucles: solo seteamos si cambio algo
//       let changed = false;
//       if (s !== this.sortBy()) { this.sortBy.set(s); changed = true; }
//       if (p !== this.page())   { this.page.set(p);  changed = true; }
//       if (l !== this.limit())  { this.limit.set(l); changed = true; }
//       if (changed) this.cargar();
//     });

//     // 3) Primera carga
//     this.cargar();
//   }

//   cargar() {
//     this.api.listar({
//       sortBy: this.sortBy(),
//       page: this.page(),
//       limit: this.limit(),
//     }).subscribe({
//       next: (r: Page<Publicacion>) => {
//         this.publicaciones.set(r.items);
//         this.total.set(r.total);
//       },
//       error: err => console.error('Error listando publicaciones', err),
//     });
//   }

//   private pushUrl() {
//     this.router.navigate([], {
//       relativeTo: this.route,
//       queryParams: {
//         sortBy: this.sortBy(),
//         page: this.page(),
//         limit: this.limit(),
//       },
//       replaceUrl: true,          
//       queryParamsHandling: ''    
//     });
//   }

//   go(p: number) {
//     const max = Math.max(1, this.pages());
//     const clamped = Math.min(Math.max(1, p), max);
//     if (clamped === this.page()) return;
//     this.page.set(clamped);
//     this.pushUrl();
//     this.cargar();
//   }

//   cambiarOrden(v: Orden) {
//     if (v === this.sortBy()) return;
//     this.sortBy.set(v);
//     this.page.set(1); // al cambiar orden, volver a pagina 1
//     this.pushUrl();
//     this.cargar();
//   }

//   cambiarLimit(nuevo: number) {
//     if (nuevo === this.limit()) return;
//     this.limit.set(nuevo);
//     this.page.set(1);
//     this.pushUrl();
//     this.cargar();
//   }


// // ==============================

//   crearPub = (d: { titulo: string; descripcion: string; imagen?: File | null }) => {
//     this.api.crear(d).subscribe({
//       next: (pub: Publicacion) => {
//         // Si estamos en pagina 1 y orden por fecha, anteponer; si no, recargar.
//         if (this.sortBy() === 'fecha' && this.page() === 1) {
//           this.publicaciones.update(list => [pub, ...list]); 
//           this.total.set(this.total() + 1);
//         } else {
//           this.cargar();
//         }
//       },
//       error: (err) => console.error('Error creando publicación', err),
//     });
//   };

//   like(id: string) {
//     this.api.like(id).subscribe({
//       next: (res: Publicacion | { alreadyLiked: true }) => {
//         if ('alreadyLiked' in res) return;
//         this.publicaciones.update(list => list.map(p => p._id === id ? res : p));
//       },
//       error: (err) => console.error('Error like', err),
//     });
//   }

//   unlike(id: string) {
//     this.api.unlike(id).subscribe({
//       next: (res: Publicacion | { notLiked: true }) => {
//         if ('notLiked' in res) {
//           return;
//         }
//         this.publicaciones.update(list => list.map(p => p._id === id ? res : p));
//       },
//       error: (err) => console.error('Error unlike', err),
//     });
//   }

//   comentar(e: { id: string; texto: string }) {
//     this.api.comentar(e.id, e.texto).subscribe({
//       next: (pub: Publicacion) => {
//         this.publicaciones.update(list => list.map(p => p._id === pub._id ? pub : p));
//       },
//       error: (err) => console.error('Error comentar', err),
//     });
//   }

//   eliminar(id: string) {
//     this.api.eliminar(id).subscribe({
//       next: () => {
//         this.publicaciones.update(list => list.filter(p => p._id !== id));
//         this.total.set(Math.max(0, this.total() - 1));
//         if (this.publicaciones().length === 0 && this.page() > 1) {
//           this.go(this.page() - 1); // retrocede si quedó vacía la página
//         }
//       },
//       error: (err) => console.error('Error eliminar', err),
//     });
//   }

//   trackPub = (index: number, p: Publicacion) => {
//   // usa _id si existe (y casteado a string por las dudas)
//   const id = (p as any)?._id;
//   if (id) return String(id);

//   // fallback: timestamp + correo del autor si viene
//   const created = (p as any)?.createdAt ? new Date((p as any).createdAt).getTime() : '';
//   const correo  = (p as any)?.usuario?.correo || '';

//   // último recurso: el índice (si no hay nada mejor)
//   return (created && correo) ? `${created}-${correo}` : index;
// };

// }


import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesApi, Publicacion, Orden, Page } from '../../service/publicaciones.service';
import { PublicacionFormComponent } from '../../components/publicacion-form/publicacion-form';
import { PublicacionCardComponent } from '../../components/publicacion-card/publicacion-card';

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

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  limit = signal(10);
  page = signal(1);
  sortBy = signal<Orden>('fecha');
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));

  // ✅ páginas reales (1..N) para evitar arrays “huecos”
  pageNumbers = computed(() =>
    Array.from({ length: this.pages() }, (_, i) => i + 1)
  );

  // ✅ track único/estable para cada publicación
  trackPub = (index: number, p: Publicacion) => {
    const id = (p as any)?._id;
    if (id) return String(id);
    const created = (p as any)?.createdAt ? new Date((p as any).createdAt).getTime() : '';
    const correo  = (p as any)?.usuario?.correo || '';
    return (created && correo) ? `${created}-${correo}` : `idx-${index}`;
  };

  ngOnInit() {
    // 1) Inicializar desde la URL
    const q = this.route.snapshot.queryParamMap;
    this.sortBy.set((q.get('sortBy') as Orden) ?? 'fecha');
    this.page.set(Math.max(1, +(q.get('page') ?? 1)));
    this.limit.set(Math.max(1, +(q.get('limit') ?? 10)));

    // 2) Reaccionar a cambios en la URL (back/forward del navegador)
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

    // 3) Primera carga
    this.cargar();
  }

  cargar() {
    this.api.listar({
      sortBy: this.sortBy(),
      page: this.page(),
      limit: this.limit(),
    }).subscribe({
      next: (r: Page<Publicacion>) => {
        this.publicaciones.set(r.items);
        this.total.set(r.total);
      },
      error: err => console.error('Error listando publicaciones', err),
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

  // ==============================

  crearPub = (d: { titulo: string; descripcion: string; imagen?: File | null }) => {
    this.api.crear(d).subscribe({
      next: (pub: Publicacion) => {
        if (this.sortBy() === 'fecha' && this.page() === 1) {
          this.publicaciones.update(list => [pub, ...list]);
          this.total.set(this.total() + 1);
        } else {
          this.cargar();
        }
      },
      error: (err) => console.error('Error creando publicación', err),
    });
  };

  like(id: string) {
    this.api.like(id).subscribe({
      next: (res: Publicacion | { alreadyLiked: true }) => {
        if ('alreadyLiked' in res) return;
        this.publicaciones.update(list => list.map(p => p._id === id ? res : p));
      },
      error: (err) => console.error('Error like', err),
    });
  }

  unlike(id: string) {
    this.api.unlike(id).subscribe({
      next: (res: Publicacion | { notLiked: true }) => {
        if ('notLiked' in res) return;
        this.publicaciones.update(list => list.map(p => p._id === id ? res : p));
      },
      error: (err) => console.error('Error unlike', err),
    });
  }

  comentar(e: { id: string; texto: string }) {
    this.api.comentar(e.id, e.texto).subscribe({
      next: (pub: Publicacion) => {
        this.publicaciones.update(list => list.map(p => p._id === pub._id ? pub : p));
      },
      error: (err) => console.error('Error comentar', err),
    });
  }

  eliminar(id: string) {
    this.api.eliminar(id).subscribe({
      next: () => {
        this.publicaciones.update(list => list.filter(p => p._id !== id));
        this.total.set(Math.max(0, this.total() - 1));
        if (this.publicaciones().length === 0 && this.page() > 1) {
          this.go(this.page() - 1);
        }
      },
      error: (err) => console.error('Error eliminar', err),
    });
  }
}
