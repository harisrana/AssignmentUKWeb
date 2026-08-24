import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { Announcement } from '../../../../core/models/announcement.model';

/** Admin-only site announcement management — Configuration → Announcements. */
@Component({
  selector: 'app-announcements-page',
  imports: [ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Announcements" subtitle="Manage banner messages shown across the public site." />

    <div class="max-w-4xl space-y-6">
      <!-- Existing announcements -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Announcements</h3>

        <div class="space-y-2">
          @for (announcement of announcements(); track announcement.id) {
            <div class="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 flex-wrap" [class.opacity-50]="!announcement.isActive">
              <p class="flex-1 min-w-[200px] text-sm text-brand-navy">{{ announcement.message }}</p>
              <span class="text-xs text-secondary shrink-0">{{ announcement.isActive ? 'Active' : 'Inactive' }}</span>
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-brand-navy hover:bg-surface-container shrink-0"
                (click)="toggleActive(announcement)"
                [title]="announcement.isActive ? 'Deactivate' : 'Activate'"
              >
                <span class="material-symbols-outlined text-lg">{{ announcement.isActive ? 'toggle_on' : 'toggle_off' }}</span>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10 shrink-0"
                (click)="remove(announcement)"
                title="Delete"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          } @empty {
            <p class="text-sm text-secondary py-4 text-center">No announcements yet — add one below.</p>
          }
        </div>
      </section>

      <!-- Add new announcement -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Add Announcement</h3>

        <form [formGroup]="announcementForm" class="space-y-1.5">
          <label class="text-xs font-semibold text-secondary">Message</label>
          <textarea
            formControlName="message"
            rows="2"
            placeholder="e.g. 20% off all Platinum orders this week!"
            class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-brand-orange rounded-lg px-3 py-2.5 text-sm text-brand-navy outline-none resize-none"
          ></textarea>
        </form>

        <button
          type="button"
          (click)="add()"
          [disabled]="announcementForm.invalid"
          class="mt-4 px-5 py-2.5 rounded-lg bg-brand-orange text-white text-sm font-bold disabled:opacity-50"
        >
          Add Announcement
        </button>
      </section>
    </div>
  `,
})
export class AnnouncementsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AnnouncementService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notify = inject(NotificationService);

  protected readonly announcements = signal<Announcement[]>([]);

  protected readonly announcementForm = this.fb.nonNullable.group({
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.service.list(true).subscribe((announcements) => this.announcements.set(announcements));
  }

  add(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const { message } = this.announcementForm.getRawValue();

    this.service.create({ message: message.trim(), isActive: true }).subscribe({
      next: () => {
        this.announcementForm.reset({ message: '' });
        this.load();
        this.notify.success('Announcement added.');
      },
      error: (err) => this.notify.error(err?.error?.message ?? 'Could not add the announcement.'),
    });
  }

  toggleActive(announcement: Announcement): void {
    this.service.update(announcement.id, { message: announcement.message, isActive: !announcement.isActive }).subscribe({
      next: () => this.load(),
      error: () => this.notify.error('Could not update the announcement.'),
    });
  }

  remove(announcement: Announcement): void {
    this.confirmDialog
      .confirm({
        title: 'Delete announcement?',
        message: `Delete "${announcement.message}"? This can't be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.remove(announcement.id).subscribe({
          next: () => this.load(),
          error: () => this.notify.error('Could not delete the announcement.'),
        });
      });
  }
}
