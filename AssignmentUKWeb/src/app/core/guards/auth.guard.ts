import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

/**
 * Blocks access to routes unless a valid session exists. If an access token is
 * present it optimistically restores the user from its claims.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  if (tokenService.isAccessTokenValid() && auth.restoreFromToken()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
