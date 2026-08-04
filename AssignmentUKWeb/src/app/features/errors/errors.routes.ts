import { Routes } from '@angular/router';

export const ERROR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '404' },
  {
    path: '403',
    title: 'Access Denied',
    data: {
      code: '403',
      heading: 'Access Denied',
      message: "You don't have permission to view this page.",
      icon: 'block',
    },
    loadComponent: () => import('./error-page/error-page.component').then((m) => m.ErrorPageComponent),
  },
  {
    path: '404',
    title: 'Page Not Found',
    data: {
      code: '404',
      heading: 'Page Not Found',
      message: 'The page you are looking for could not be found.',
      icon: 'search_off',
    },
    loadComponent: () => import('./error-page/error-page.component').then((m) => m.ErrorPageComponent),
  },
  {
    path: '500',
    title: 'Server Error',
    data: {
      code: '500',
      heading: 'Something Went Wrong',
      message: 'An internal server error occurred. Please try again later.',
      icon: 'error',
    },
    loadComponent: () => import('./error-page/error-page.component').then((m) => m.ErrorPageComponent),
  },
];
