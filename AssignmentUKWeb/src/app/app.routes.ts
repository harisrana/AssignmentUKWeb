import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Root routing table. Every feature is lazy-loaded via `loadChildren` /
 * `loadComponent` to keep the initial bundle small.
 */
export const routes: Routes = [
  // Public marketing site (Home / About / Services / Pricing) under a shared
  // navbar + footer master layout.
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    loadChildren: () =>
      import('./features/marketing/marketing.routes').then((m) => m.MARKETING_ROUTES),
  },

  // Authentication area (login, forgot password, ...) under the auth layout.
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Protected application shell (dashboard, admin, profile, ...).
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    loadChildren: () => import('./features/features.routes').then((m) => m.FEATURE_ROUTES),
  },

  // Error pages (403 / 404 / 500).
  {
    path: 'error',
    loadChildren: () => import('./features/errors/errors.routes').then((m) => m.ERROR_ROUTES),
  },

  { path: '**', redirectTo: 'error/404' },
];
