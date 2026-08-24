import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EnquiryStatusHistoryEntry } from '../../models/dashboard.model';

export interface StatusHistoryDialogData {
  studentName: string;
  history: EnquiryStatusHistoryEntry[];
  statusLabel: (status: string) => string;
  statusColor: (status: string) => string;
  statusTextColor: (status: string) => string;
}

/** Visual timeline of an enquiry's status changes, from creation onward. */
@Component({
  selector: 'app-status-history-dialog',
  imports: [DatePipe, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-2 min-w-0">
      <div class="flex items-start justify-between gap-3 mb-1">
        <div>
          <h2 class="font-bold text-lg text-brand-navy" mat-dialog-title>Task Status History</h2>
          <p class="text-sm text-secondary">Visual timeline of status changes for {{ data.studentName }}</p>
        </div>
        @if (currentStatus(); as current) {
          <span
            class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            [style.background-color]="data.statusColor(current)"
            [style.color]="data.statusTextColor(current)"
          >
            {{ data.statusLabel(current) }}
          </span>
        }
      </div>

      <mat-dialog-content>
        @if (data.history.length === 0) {
          <p class="text-secondary py-4">No status changes recorded yet.</p>
        } @else {
          <!-- Horizontal step timeline: fixed-width steps in a scroller, so long histories scroll instead of overflowing the dialog -->
          <div class="overflow-x-auto mt-6 mb-8 -mx-2 px-2">
            <div class="flex items-start" style="width: max-content;">
              @for (entry of data.history; track entry.id; let last = $last) {
                <div class="flex flex-col items-center gap-1 shrink-0" style="width: 64px;">
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    [style.background-color]="data.statusColor(entry.toStatus)"
                    [style.color]="data.statusTextColor(entry.toStatus)"
                  >
                    @if (last) {
                      <span class="material-symbols-outlined text-sm">check</span>
                    } @else {
                      <span class="w-2 h-2 rounded-full" [style.background-color]="data.statusTextColor(entry.toStatus)"></span>
                    }
                  </span>
                  <span class="text-[11px] font-semibold text-brand-navy text-center leading-tight px-0.5">
                    {{ data.statusLabel(entry.toStatus) }}
                  </span>
                  <span class="text-[10px] text-secondary whitespace-nowrap">{{ entry.changedAt | date: 'dd MMM' }}</span>
                </div>
                @if (!last) {
                  <div class="h-0.5 bg-outline-variant/40 shrink-0 mt-3" style="width: 20px;"></div>
                }
              }
            </div>
          </div>

          <hr class="border-outline-variant/20 mb-4" />

          <!-- Detail list -->
          <ol class="space-y-4">
            @for (entry of data.history; track entry.id; let last = $last) {
              <li class="flex items-start gap-3">
                <span
                  class="w-3 h-3 rounded-full mt-1 shrink-0 flex items-center justify-center"
                  [style.background-color]="data.statusColor(entry.toStatus)"
                >
                  @if (last) {
                    <span class="material-symbols-outlined" style="font-size: 10px;" [style.color]="data.statusTextColor(entry.toStatus)">check</span>
                  }
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-brand-navy">{{ data.statusLabel(entry.toStatus) }}</p>
                  <p class="text-xs text-secondary">
                    @if (!entry.fromStatus) {
                      Enquiry created
                    } @else {
                      Changed by {{ entry.changedByName ?? 'System' }}
                    }
                  </p>
                </div>
                <span class="text-xs text-secondary whitespace-nowrap">{{ entry.changedAt | date: 'dd MMM yyyy' }}</span>
              </li>
            }
          </ol>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="mt-4">
        <button mat-button (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
})
export class StatusHistoryDialogComponent {
  protected readonly data = inject<StatusHistoryDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<StatusHistoryDialogComponent>);

  protected readonly currentStatus = computed(() => {
    const history = this.data.history;
    return history.length > 0 ? history[history.length - 1].toStatus : null;
  });

  close(): void {
    this.ref.close();
  }
}
