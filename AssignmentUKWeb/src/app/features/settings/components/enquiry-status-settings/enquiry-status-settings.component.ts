import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EnquiryStatusStore } from '../../../../core/services/enquiry-status.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EnquiryStatusOption } from '../../../../core/models/enquiry-status.model';

const DEFAULT_NEW_COLOR = '#3B82F6';

/**
 * Admin-only CRUD + reorder for the enquiry status catalog (Settings → Enquiry Statuses).
 * Every field is saved to the database — nothing here is hard-coded, unlike the old fixed enum.
 */
@Component({
  selector: 'app-enquiry-status-settings',
  imports: [FormsModule, MatSlideToggleModule],
  template: `
    <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
      <h3 class="font-bold text-brand-navy mb-1">Enquiry Statuses</h3>
      <p class="text-sm text-secondary mb-4">
        Manage the workflow statuses staff can assign to enquiries. Renaming a status updates it everywhere it's already used.
      </p>

      <div class="space-y-2">
        @for (status of store.allStatuses(); track status.id; let first = $first; let last = $last) {
          <div class="flex items-center gap-3 bg-surface-container-low rounded-xl px-3 py-2.5" [class.opacity-50]="!status.isActive">
            <input
              type="color"
              [value]="status.colorHex"
              (change)="onColorChange(status, $any($event.target).value)"
              class="w-8 h-8 rounded-lg border border-outline-variant/30 cursor-pointer shrink-0"
              title="Status color"
            />
            <input
              type="text"
              [value]="status.name"
              (blur)="onNameBlur(status, $any($event.target).value)"
              class="flex-1 min-w-0 bg-transparent border border-transparent hover:border-outline-variant/30 focus:border-brand-orange rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-navy outline-none"
            />
            <span class="text-xs text-secondary shrink-0">{{ status.isActive ? 'Active' : 'Inactive' }}</span>
            <mat-slide-toggle
              [checked]="status.isActive"
              (change)="onActiveChange(status, $event.checked)"
              class="shrink-0"
            />
            <div class="flex items-center shrink-0">
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-brand-navy hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                [disabled]="first"
                (click)="moveUp(status)"
                title="Move up"
              >
                <span class="material-symbols-outlined text-lg">arrow_upward</span>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-brand-navy hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                [disabled]="last"
                (click)="moveDown(status)"
                title="Move down"
              >
                <span class="material-symbols-outlined text-lg">arrow_downward</span>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10"
                (click)="remove(status)"
                title="Delete"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        } @empty {
          <p class="text-sm text-secondary py-4 text-center">No statuses yet — add one below.</p>
        }
      </div>

      <div class="flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant/10">
        <input
          type="color"
          [(ngModel)]="newColor"
          class="w-8 h-8 rounded-lg border border-outline-variant/30 cursor-pointer shrink-0"
          title="New status color"
        />
        <input
          type="text"
          [(ngModel)]="newName"
          placeholder="New status name…"
          (keyup.enter)="add()"
          class="flex-1 min-w-0 bg-surface-container-low border border-outline-variant/30 focus:border-brand-orange rounded-lg px-3 py-2 text-sm text-brand-navy outline-none"
        />
        <button
          type="button"
          (click)="add()"
          [disabled]="!newName().trim()"
          class="px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-bold disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </section>
  `,
})
export class EnquiryStatusSettingsComponent implements OnInit {
  protected readonly store = inject(EnquiryStatusStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notify = inject(NotificationService);

  protected readonly newName = signal('');
  protected newColor = DEFAULT_NEW_COLOR;

  ngOnInit(): void {
    this.store.loadAll();
  }

  onColorChange(status: EnquiryStatusOption, colorHex: string): void {
    this.store.update(status.id, { name: status.name, colorHex, isActive: status.isActive }).subscribe({
      error: () => this.notify.error('Could not update the color.'),
    });
  }

  onNameBlur(status: EnquiryStatusOption, name: string): void {
    const trimmed = name.trim();
    if (!trimmed || trimmed === status.name) {
      return;
    }
    this.store.update(status.id, { name: trimmed, colorHex: status.colorHex, isActive: status.isActive }).subscribe({
      error: (err) => this.notify.error(err?.error?.message ?? 'Could not rename the status.'),
    });
  }

  onActiveChange(status: EnquiryStatusOption, isActive: boolean): void {
    this.store.update(status.id, { name: status.name, colorHex: status.colorHex, isActive }).subscribe({
      error: () => this.notify.error('Could not update the status.'),
    });
  }

  moveUp(status: EnquiryStatusOption): void {
    this.store.moveUp(status.id).subscribe();
  }

  moveDown(status: EnquiryStatusOption): void {
    this.store.moveDown(status.id).subscribe();
  }

  remove(status: EnquiryStatusOption): void {
    this.confirmDialog
      .confirm({
        title: 'Delete status?',
        message: `Delete "${status.name}"? This can't be undone. Statuses currently in use on any enquiry can't be deleted — deactivate them instead.`,
        confirmText: 'Delete',
        variant: 'danger',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.remove(status.id).subscribe({
          error: (err) => this.notify.error(err?.error?.message ?? 'Could not delete the status.'),
        });
      });
  }

  add(): void {
    const name = this.newName().trim();
    if (!name) {
      return;
    }
    this.store.create({ name, colorHex: this.newColor }).subscribe({
      next: () => {
        this.newName.set('');
        this.newColor = DEFAULT_NEW_COLOR;
      },
      error: (err) => this.notify.error(err?.error?.message ?? 'Could not add the status.'),
    });
  }
}
