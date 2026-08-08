import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Blocks access to routes unless a valid session exists. If an access token is
 * present it optimistically restores the user from its claims; if only an
 * expired access token plus a valid refresh token are present, it silently
 * refreshes before deciding.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.tryRestoreSession().pipe(
    map((restored) =>
      restored
        ? true
        : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } }),
    ),
  );
};
