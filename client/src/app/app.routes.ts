import { Routes } from '@angular/router';
import { Route } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { AdminGuard } from './guards/admin-guard';
import { Cargando } from './components/cargando/cargando';
// import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
  // { path: '', redirectTo: 'cargando', pathMatch: 'full' },
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
    path: 'publicaciones/:id',
    loadComponent: () =>
      import('./pages/publicacion/publicacion').then((m) => m.PublicacionDetalle),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [AuthGuard, AdminGuard],
  },
  
  { path: '', redirectTo: '/publicaciones', pathMatch: 'full' },
  { path: '**', redirectTo: '/publicaciones' },
];