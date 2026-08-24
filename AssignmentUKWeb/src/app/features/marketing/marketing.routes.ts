import { Routes } from '@angular/router';

/**
 * Public marketing pages. All render inside PublicLayoutComponent (shared
 * navbar + footer), wired up in app.routes.ts.
 */
export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Assignment Writings UK — Best UK Assignment Help',
    loadComponent: () =>
      import('../landing/pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
  },
  {
    path: 'about',
    title: 'About Us • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'services',
    title: 'Our Services • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/services/services.component').then((m) => m.ServicesComponent),
  },
  {
    path: 'pricing',
    title: 'Pricing • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
  },
  {
    path: 'order',
    title: 'Order Now • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/order/order.component').then((m) => m.OrderComponent),
  },
];
