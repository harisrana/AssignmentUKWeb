import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    title: 'Roles • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/role-list/role-list.component').then((m) => m.RoleListComponent),
  },
];
