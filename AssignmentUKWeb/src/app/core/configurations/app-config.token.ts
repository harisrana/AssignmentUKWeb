import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export type AppConfig = typeof environment;

/**
 * Injectable configuration token. Prefer injecting APP_CONFIG over importing
 * `environment` directly — it makes services testable (SOLID / DIP).
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
