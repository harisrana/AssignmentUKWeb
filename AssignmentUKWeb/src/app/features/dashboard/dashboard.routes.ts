import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    title: 'Dashboard • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
];
