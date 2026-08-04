import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { usersFeature } from './state/user.reducer';
import * as userEffects from './state/user.effects';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PERMISSIONS } from '../../core/constants/app.constants';
import { userResolver } from './resolvers/user.resolver';

/**
 * Users feature routes. The feature's NgRx state + effects are registered here
 * (lazy) so they only load when the user navigates into this feature.
 */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(usersFeature), provideEffects(userEffects)],
    children: [
      {
        path: '',
        title: 'Users • Assignment Writings UK',
        loadComponent: () =>
          import('./pages/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: ':id',
        title: 'User Details',
        data: { breadcrumb: 'Details', permissions: [PERMISSIONS.usersView] },
        canActivate: [permissionGuard],
        resolve: { user: userResolver },
        loadComponent: () =>
          import('./pages/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
      },
    ],
  },
];
