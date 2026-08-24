import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { Announcement } from '../../../core/models/announcement.model';

/** Slim banner across the top of the public site showing active admin-configured announcements. */
@Component({
  selector: 'app-announcement-bar',
  template: `
    @if (visible(); as announcement) {
      <div class="bg-brand-orange text-white">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-sm font-semibold min-w-0">
            <span class="material-symbols-outlined text-base shrink-0">campaign</span>
            <span class="truncate">{{ announcement.message }}</span>
          </div>
          <button
            type="button"
            (click)="dismiss(announcement.id)"
            class="shrink-0 text-white/80 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <span class="material-symbols-outlined text-lg align-middle">close</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class AnnouncementBarComponent implements OnInit {
  private readonly service = inject(AnnouncementService);

  private readonly announcements = signal<Announcement[]>([]);
  private readonly dismissedId = signal<string | null>(null);

  /** The most recent active announcement, unless the visitor has just dismissed it. */
  protected readonly visible = computed(() => {
    const current = this.announcements()[0];
    return current && current.id !== this.dismissedId() ? current : null;
  });

  ngOnInit(): void {
    this.service.listActive().subscribe((announcements) => this.announcements.set(announcements));
  }

  dismiss(id: string): void {
    this.dismissedId.set(id);
  }
}
