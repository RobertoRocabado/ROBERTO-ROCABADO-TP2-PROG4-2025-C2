import { Routes } from '@angular/router';
import { Route } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { Cargando } from './components/cargando/cargando';
import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  { path: 'cargando', component: Cargando },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    canActivate: [GuestGuard],
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
    canActivate: [GuestGuard],
  },

  {
    path: 'publicaciones',
    loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
    canActivate: [AuthGuard],
  },
  {
    path: 'miperfil',
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.MiPerfil),
    canActivate: [AuthGuard],
  },

  {
    // path: 'publicaciones/:id',
    // loadComponent: () =>
    //   import('./pages/publicacion/publicacion').then((m) => m.PublicacionDetalle),
    path: 'publicaciones/:id',
  loadComponent: () =>
    import('./pages/publicacion/publicacion')
      .then(m => m.PublicacionDetalle),
  renderMode: 'prerender',
  // 👇 Devolvés una lista de objetos con los params para generar
  getPrerenderParams: async () => {
    // Opción A: lista fija (rápida para probar)
    // return [{ id: '674adf3f1c...' }, { id: '674be0a21d...' }];

    // Opción B: traer IDs desde tu API pública (accesible en build)
    const res = await fetch(`${process.env['NG_APP_API_URL']}/publicaciones/ids`, {
      headers: { 'Accept': 'application/json' },
    });
    const ids: string[] = await res.json();
    return ids.map((id) => ({ id }));
  },
  
  { path: '', redirectTo: '/publicaciones', pathMatch: 'full' },
  { path: '**', redirectTo: '/publicaciones' },
];