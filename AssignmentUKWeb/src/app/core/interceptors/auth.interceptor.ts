import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const AUTH_SKIP_URLS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.refresh,
];

/**
 * Attaches `Authorization: Bearer <token>` to every outgoing request, except
 * the login/register/refresh calls which must not carry a (possibly stale) token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  if (AUTH_SKIP_URLS.some((url) => req.url.startsWith(url))) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      // Signals to the server this is a same-origin XHR (CSRF defence-in-depth).
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  return next(authReq);
};
