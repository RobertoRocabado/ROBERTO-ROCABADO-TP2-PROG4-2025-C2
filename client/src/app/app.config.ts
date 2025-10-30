import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { withCredentialsInterceptor } from './interceptors/with-credentials.interceptor';
import { authInterceptor } from './interceptors/auth.interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // 👇 SOLO UNA llamada a provideHttpClient
    provideHttpClient(
      withInterceptors([
        withCredentialsInterceptor, // debe ir primero si toca request.init
        authInterceptor,            // luego el que agrega Authorization, etc.
      ])
    ),
  ],
};