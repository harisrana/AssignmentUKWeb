import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../configurations/app-config.token';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Off = 4,
}

/**
 * Centralised, environment-aware logging service.
 * In production the level is raised to ERROR and (optionally) shipped to a
 * remote sink. Never `console.log` directly elsewhere in the app.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly config = inject(APP_CONFIG);
  private readonly level: LogLevel = this.config.logging.level as LogLevel;

  debug(message: string, ...params: unknown[]): void {
    this.write(LogLevel.Debug, message, params);
  }

  info(message: string, ...params: unknown[]): void {
    this.write(LogLevel.Info, message, params);
  }

  warn(message: string, ...params: unknown[]): void {
    this.write(LogLevel.Warn, message, params);
  }

  error(message: string, ...params: unknown[]): void {
    this.write(LogLevel.Error, message, params);
  }

  private write(level: LogLevel, message: string, params: unknown[]): void {
    if (level < this.level) {
      return;
    }
    const stamp = new Date().toISOString();
    const label = `[${LogLevel[level].toUpperCase()}] ${stamp}`;

    switch (level) {
      case LogLevel.Error:
        console.error(label, message, ...params);
        break;
      case LogLevel.Warn:
        console.warn(label, message, ...params);
        break;
      case LogLevel.Info:
        console.info(label, message, ...params);
        break;
      default:
        console.debug(label, message, ...params);
    }

    if (this.config.logging.remote && level >= LogLevel.Error) {
      this.shipToRemote(level, message, params);
    }
  }

  private shipToRemote(level: LogLevel, message: string, params: unknown[]): void {
    // Fire-and-forget; never let logging break the app.
    try {
      navigator.sendBeacon?.(
        this.config.logging.remoteUrl,
        JSON.stringify({ level: LogLevel[level], message, params, at: Date.now() }),
      );
    } catch {
      /* swallow */
    }
  }
}
