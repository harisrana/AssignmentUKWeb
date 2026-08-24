import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MenuItem } from '../models/menu-item.model';
import { PERMISSIONS, ROLES } from '../constants/app.constants';

/**
 * Provides the dynamic sidebar/menu, filtered against the current user's
 * roles and permissions. Drives both the sidebar and dynamic navigation.
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly auth = inject(AuthService);

  private readonly source: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard', permissions: [PERMISSIONS.dashboardView] },
    { label: 'Live Chat', icon: 'chat', route: '/app/chat', permissions: [PERMISSIONS.chatManage] },
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      roles: [ROLES.admin, ROLES.manager],
      children: [
        { label: 'Users', icon: 'group', route: '/app/users', permissions: [PERMISSIONS.usersView] },
        { label: 'Roles', icon: 'badge', route: '/app/roles', permissions: [PERMISSIONS.rolesView] },
        { label: 'Permissions', icon: 'key', route: '/app/permissions', permissions: [PERMISSIONS.permissionsView] },
      ],
    },
    {
      label: 'Configuration',
      icon: 'tune',
      roles: [ROLES.admin, ROLES.manager],
      children: [
        { label: 'Add Rule', icon: 'rule', route: '/app/configuration/pricing-rules' },
        { label: 'Announcements', icon: 'campaign', route: '/app/configuration/announcements' },
      ],
    },
    {
      label: 'Reports',
      icon: 'summarize',
      roles: [ROLES.admin, ROLES.manager],
      children: [
        { label: 'All Orders', icon: 'receipt_long', route: '/app/reports/orders' },
      ],
    },
    { label: 'Settings', icon: 'settings', route: '/app/settings' },
    { label: 'My Profile', icon: 'account_circle', route: '/app/profile' },
  ];

  /** Menu filtered to what the current user is allowed to see. */
  readonly menu = computed<MenuItem[]>(() => {
    // Re-read reactive auth state so the menu recomputes on login/logout.
    this.auth.permissions();
    this.auth.roles();
    return this.filter(this.source);
  });

  private filter(items: MenuItem[]): MenuItem[] {
    return items
      .filter((item) => this.canSee(item))
      .map((item) => (item.children ? { ...item, children: this.filter(item.children) } : item))
      .filter((item) => !item.children || item.children.length > 0);
  }

  private canSee(item: MenuItem): boolean {
    const roleOk = !item.roles || this.auth.hasAnyRole(item.roles);
    const permOk = !item.permissions || this.auth.hasAllPermissions(item.permissions);
    return roleOk && permOk;
  }
}
