import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Permission-based route protection. Configure via route data:
 *   data: { permissions: ['users.view'] }
 * Access is granted only if the user has ALL listed permissions.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = (route.data['permissions'] as string[] | undefined) ?? [];
  if (required.length === 0 || auth.hasAllPermissions(required)) {
    return true;
  }

  return router.createUrlTree(['/error/403']);
};
