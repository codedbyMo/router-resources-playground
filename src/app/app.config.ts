import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterResources } from '@angular/router';
import { routes } from './app.routes';
import { inMemoryApiInterceptor } from './in-memory-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless is the default in Angular 21 and later. It is stated
    // explicitly here so the playground's change detection mode is
    // visible rather than implied.
    provideZonelessChangeDetection(),
    // withRouterResources() opts the router into route resources.
    // withComponentInputBinding() lets it bind resource values (and
    // resolver results) to component inputs with matching names.
    provideRouter(routes, withComponentInputBinding(), withRouterResources()),
    // The interceptor serves the declared fixtures, so every route
    // resource runs without a backend server.
    provideHttpClient(withFetch(), withInterceptors([inMemoryApiInterceptor])),
  ],
};
