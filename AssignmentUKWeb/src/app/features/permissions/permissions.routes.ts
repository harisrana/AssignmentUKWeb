import { Routes } from '@angular/router';

export const PERMISSIONS_ROUTES: Routes = [
  {
    path: '',
    title: 'Permissions • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/permission-list/permission-list.component').then(
        (m) => m.PermissionListComponent,
      ),
  },
];
