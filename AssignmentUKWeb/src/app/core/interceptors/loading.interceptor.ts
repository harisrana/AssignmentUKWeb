import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Set on a request's context to opt it out of the global spinner. */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/**
 * Shows the global loading spinner while any non-skipped request is in flight.
 * Background/polling requests can opt out via `context.set(SKIP_LOADING, true)`.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
