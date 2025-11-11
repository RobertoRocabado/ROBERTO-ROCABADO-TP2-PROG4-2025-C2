import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptors';
import { serverRoutes } from './app/app.routes.server';
import { ServerRoute } from '@angular/ssr';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),                  // 👈 soluciona NG02801
      withInterceptors([authInterceptor])
    ),
    provideClientHydration(),       // si usás SSR/hydration
  ],
}).catch(console.error);

