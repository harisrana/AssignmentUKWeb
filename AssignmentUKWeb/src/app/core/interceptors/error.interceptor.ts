import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { ApiErrorService } from '../services/api-error.service';
import { NotificationService } from '../services/notification.service';
import { LoggerService } from '../services/logger.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

/**
 * Single-flight refresh state shared across concurrent requests.
 * Module-level so all requests that 401 at once queue behind one refresh call.
 */
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

/**
 * Global HTTP error interceptor:
 *  - On 401, transparently refreshes the token and retries the request once.
 *  - Queues concurrent 401s behind a single refresh call.
 *  - Redirects to /auth/login if refresh fails.
 *  - Surfaces user-friendly messages for all other errors.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const apiError = inject(ApiErrorService);
  const notify = inject(NotificationService);
  const logger = inject(LoggerService);

  const isAuthEndpoint = [
    API_ENDPOINTS.auth.login,
    API_ENDPOINTS.auth.register,
    API_ENDPOINTS.auth.refresh,
  ].some((url) => req.url.startsWith(url));

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return handle401(req, next, auth, tokenService, router, logger);
      }

      if (error instanceof HttpErrorResponse) {
        logger.error(`HTTP ${error.status} on ${req.method} ${req.url}`, error.message);
        // Don't double-toast auth failures (handled by redirect).
        if (error.status !== 401) {
          notify.error(apiError.toUserMessage(error));
        }
        if (error.status === 403) {
          void router.navigate(['/error/403']);
        }
      }
      return throwError(() => error);
    }),
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  tokenService: TokenService,
  router: Router,
  logger: LoggerService,
): Observable<HttpEvent<unknown>> {
  if (!tokenService.getRefreshToken()) {
    return forceLogin(auth, router);
  }

  if (isRefreshing) {
    // Wait for the in-flight refresh, then retry with the new token.
    return refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(withToken(req, token))),
    );
  }

  isRefreshing = true;
  refreshedToken$.next(null);
  logger.debug('Access token expired — attempting refresh');

  return auth.refreshToken().pipe(
    switchMap((tokens) => {
      isRefreshing = false;
      refreshedToken$.next(tokens.accessToken);
      return next(withToken(req, tokens.accessToken));
    }),
    catchError((refreshError: unknown) => {
      isRefreshing = false;
      logger.warn('Token refresh failed — logging out');
      return forceLogin(auth, router, refreshError);
    }),
  );
}

function withToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function forceLogin(auth: AuthService, router: Router, error?: unknown): Observable<never> {
  auth.clearSession();
  void router.navigate(['/auth/login'], { queryParams: { reason: 'session-expired' } });
  return throwError(() => error ?? new Error('Session expired'));
}
