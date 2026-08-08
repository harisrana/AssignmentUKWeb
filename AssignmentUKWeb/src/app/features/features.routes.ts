import { Routes } from '@angular/router';
import { permissionGuard } from '../core/guards/permission.guard';
import { roleGuard } from '../core/guards/role.guard';
import { PERMISSIONS, ROLES } from '../core/constants/app.constants';

/**
 * Child routes rendered inside the authenticated MainLayout.
 * Each feature is lazy-loaded and protected by role/permission guards.
 */
export const FEATURE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard', permissions: [PERMISSIONS.dashboardView] },
    canActivate: [permissionGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'users',
    data: { breadcrumb: 'Users', permissions: [PERMISSIONS.usersView] },
    canActivate: [permissionGuard],
    loadChildren: () => import('./users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: 'roles',
    data: { breadcrumb: 'Roles', roles: [ROLES.admin, ROLES.manager] },
    canActivate: [roleGuard],
    loadChildren: () => import('./roles/roles.routes').then((m) => m.ROLES_ROUTES),
  },
  {
    path: 'permissions',
    data: { breadcrumb: 'Permissions', permissions: [PERMISSIONS.permissionsView] },
    canActivate: [permissionGuard],
    loadChildren: () =>
      import('./permissions/permissions.routes').then((m) => m.PERMISSIONS_ROUTES),
  },
  {
    path: 'chat',
    data: { breadcrumb: 'Live Chat', permissions: [PERMISSIONS.chatManage] },
    canActivate: [permissionGuard],
    loadChildren: () => import('./chat/chat.routes').then((m) => m.CHAT_ROUTES),
  },
  {
    path: 'settings',
    data: { breadcrumb: 'Settings', permissions: [PERMISSIONS.settingsManage] },
    canActivate: [permissionGuard],
    loadChildren: () => import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
  },
  {
    path: 'profile',
    data: { breadcrumb: 'My Profile' },
    loadChildren: () => import('./profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
];
