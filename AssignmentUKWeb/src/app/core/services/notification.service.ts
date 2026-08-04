import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Central toast/notification service built on MatSnackBar.
 * Keeps styling consistent and lets components stay presentation-agnostic.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action = 'Dismiss'): void {
    this.open(message, action, 'success');
  }

  error(message: string, action = 'Dismiss'): void {
    this.open(message, action, 'error', 8000);
  }

  info(message: string, action = 'Dismiss'): void {
    this.open(message, action, 'info');
  }

  warning(message: string, action = 'Dismiss'): void {
    this.open(message, action, 'warning');
  }

  private open(message: string, action: string, type: NotificationType, duration = 4000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snack-${type}`],
    };
    this.snackBar.open(message, action, config);
  }
}
