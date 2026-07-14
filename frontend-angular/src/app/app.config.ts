import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideApi } from './api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Aktiviert den HttpClient app-weit (wie ein globaler @Bean in Spring).
    provideHttpClient(),
    // Basis-URL des generierten API-Clients leer lassen -> relative URLs
    // ("/api/posts") laufen weiter ueber den Dev-Proxy (kein CORS im Dev).
    provideApi('')
  ]
};
