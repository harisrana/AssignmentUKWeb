import { Injectable, inject, signal } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats, EnquiryStatus, RecentEnquiry } from '../models/dashboard.model';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Lightweight signal-based store for the dashboard feature. (NgRx is used for
 * cross-cutting/entity state such as auth and users; a local signal store is a
 * pragmatic choice for a read-only view like this.)
 */
@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly service = inject(DashboardService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(false);

  readonly enquiries = signal<RecentEnquiry[]>([]);
  readonly totalCount = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly enquiriesLoading = signal(false);

  load(): void {
    this.loading.set(true);
    this.service.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Fetches a page of enquiries from the server. Pass pageIndex/pageSize to change page or page size; omit to reload the current page. */
  loadEnquiries(pageIndex = this.pageIndex(), pageSize = this.pageSize()): void {
    this.enquiriesLoading.set(true);
    this.service.getEnquiries(pageIndex, pageSize).subscribe({
      next: (result) => {
        this.enquiries.set(result.items);
        this.totalCount.set(result.totalCount);
        this.pageIndex.set(result.pageIndex);
        this.pageSize.set(result.pageSize);
        this.enquiriesLoading.set(false);
      },
      error: () => this.enquiriesLoading.set(false),
    });
  }

  updateEnquiryStatus(id: string, status: EnquiryStatus): void {
    const previous = this.enquiries();
    this.enquiries.set(previous.map((e) => (e.id === id ? { ...e, status } : e)));

    this.service.updateEnquiryStatus(id, status).subscribe({
      error: () => this.enquiries.set(previous),
    });
  }
}
