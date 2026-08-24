import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  {
    path: 'orders',
    title: 'All Orders • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/orders-report-page/orders-report-page.component').then(
        (m) => m.OrdersReportPageComponent,
      ),
  },
];
