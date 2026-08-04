import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

/**
 * Global (uncaught) error handler. HTTP errors are already handled by the
 * error interceptor, so here we focus on unexpected runtime/client errors.
 * Services are resolved lazily via the Injector to avoid circular DI.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    const logger = this.injector.get(LoggerService);

    // HTTP errors are surfaced by the interceptor; just log here.
    if (error instanceof HttpErrorResponse) {
      logger.error('Uncaught HTTP error', error);
      return;
    }

    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Unhandled application error', err.message, err.stack);

    // Best-effort user notification.
    try {
      this.injector.get(NotificationService).error('An unexpected error occurred.');
    } catch {
      /* notifications unavailable during bootstrap */
    }
  }
}
