import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Role-based route protection. Configure via route data:
 *   data: { roles: ['Admin', 'Manager'] }
 * Access is granted if the user has ANY of the listed roles.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = (route.data['roles'] as string[] | undefined) ?? [];
  if (required.length === 0 || auth.hasAnyRole(required)) {
    return true;
  }

  return router.createUrlTree(['/error/403']);
};
