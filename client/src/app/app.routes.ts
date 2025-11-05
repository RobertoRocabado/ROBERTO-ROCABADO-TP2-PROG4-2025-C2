import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: 'login',    loadComponent: () => import('./pages/login/login').then(m => m.Login),       canActivate: [GuestGuard] },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro), canActivate: [GuestGuard] },

  { path: 'publicaciones', loadComponent: () => import('./pages/publicaciones/publicaciones').then(m => m.Publicaciones), canActivate: [AuthGuard] },
  { path: 'miperfil',      loadComponent: () => import('./pages/perfil/perfil').then(m => m.MiPerfil),                      canActivate: [AuthGuard] },

  { path: '', redirectTo: '/publicaciones', pathMatch: 'full' },
  { path: '**', redirectTo: '/publicaciones' }
];