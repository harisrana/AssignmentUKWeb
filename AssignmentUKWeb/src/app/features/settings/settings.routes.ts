import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: 'Settings • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
  },
];
