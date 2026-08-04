import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

/** Generic confirmation dialog. Open it via ConfirmDialogService. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="p-2">
      <div class="flex items-start gap-3 mb-4">
        <span
          class="material-symbols-outlined text-3xl"
          [class.text-error]="data.variant === 'danger'"
          [class.text-brand-orange]="data.variant !== 'danger'"
        >
          {{ data.variant === 'danger' ? 'warning' : 'help' }}
        </span>
        <div>
          <h2 class="font-bold text-lg text-brand-navy" mat-dialog-title>{{ data.title }}</h2>
        </div>
      </div>
      <mat-dialog-content>
        <p class="text-secondary">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="gap-2 mt-4">
        <button mat-button (click)="close(false)">{{ data.cancelText ?? 'Cancel' }}</button>
        <button
          mat-flat-button
          [color]="data.variant === 'danger' ? 'warn' : 'primary'"
          (click)="close(true)"
        >
          {{ data.confirmText ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);

  close(result: boolean): void {
    this.ref.close(result);
  }
}
