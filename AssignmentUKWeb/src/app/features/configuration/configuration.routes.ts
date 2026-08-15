import { Routes } from '@angular/router';

export const CONFIGURATION_ROUTES: Routes = [
  {
    path: 'pricing-rules',
    title: 'Add Rule • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/pricing-rules-page/pricing-rules-page.component').then((m) => m.PricingRulesPageComponent),
  },
];
