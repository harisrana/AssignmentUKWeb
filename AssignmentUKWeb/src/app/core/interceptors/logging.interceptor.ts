import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { LoggerService } from '../services/logger.service';

/** Debug-level logging of every request/response with timing. */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const started = performance.now();

  logger.debug(`→ ${req.method} ${req.urlWithParams}`);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const ms = Math.round(performance.now() - started);
        logger.debug(`← ${req.method} ${req.url} ${event.status} (${ms}ms)`);
      }
    }),
  );
};
