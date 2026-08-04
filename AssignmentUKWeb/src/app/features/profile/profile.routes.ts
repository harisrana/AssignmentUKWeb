import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    title: 'My Profile • Assignment Writings UK',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./pages/profile-page/profile-page.component').then((m) => m.ProfilePageComponent),
  },
];
