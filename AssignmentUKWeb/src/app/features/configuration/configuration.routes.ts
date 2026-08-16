import { Routes } from '@angular/router';

export const CONFIGURATION_ROUTES: Routes = [
  {
    path: 'pricing-rules',
    title: 'Add Rule • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/pricing-rules-page/pricing-rules-page.component').then((m) => m.PricingRulesPageComponent),
  },
  {
    path: 'announcements',
    title: 'Announcements • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/announcements-page/announcements-page.component').then((m) => m.AnnouncementsPageComponent),
  },
];
