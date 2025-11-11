import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'publicaciones/:id',
    renderMode: RenderMode.Server, // <- evita prerender para esta ruta dinámica
  },
];
