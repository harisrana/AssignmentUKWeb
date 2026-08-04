import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../configurations/app-config.token';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { LoggerService } from './logger.service';

/**
 * Idle-user detection + session timeout handling.
 *
 * Watches user activity; after `idleWarningMs` shows a warning, and after a
 * further `idleTimeoutMs` with no activity it force-logs-out. Also schedules an
 * absolute auto-logout when the JWT itself expires.
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly config = inject(APP_CONFIG);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private warnTimer?: ReturnType<typeof setTimeout>;
  private logoutTimer?: ReturnType<typeof setTimeout>;
  private readonly activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  private readonly boundReset = () => this.resetTimers();

  readonly showingWarning = signal(false);

  start(): void {
    this.activityEvents.forEach((evt) =>
      window.addEventListener(evt, this.boundReset, { passive: true }),
    );
    this.resetTimers();
    this.destroyRef.onDestroy(() => this.stop());
  }

  stop(): void {
    this.activityEvents.forEach((evt) => window.removeEventListener(evt, this.boundReset));
    this.clearTimers();
    this.showingWarning.set(false);
  }

  private resetTimers(): void {
    this.showingWarning.set(false);
    this.clearTimers();

    this.warnTimer = setTimeout(() => {
      this.showingWarning.set(true);
      this.notify.warning('You will be logged out soon due to inactivity.');
    }, this.config.session.idleWarningMs);

    this.logoutTimer = setTimeout(() => {
      this.logger.info('Session timed out due to inactivity');
      this.forceLogout();
    }, this.config.session.idleWarningMs + this.config.session.idleTimeoutMs);
  }

  private forceLogout(): void {
    this.stop();
    this.auth.clearSession();
    void this.router.navigate(['/auth/login'], { queryParams: { reason: 'timeout' } });
  }

  private clearTimers(): void {
    if (this.warnTimer) {
      clearTimeout(this.warnTimer);
    }
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }
}
