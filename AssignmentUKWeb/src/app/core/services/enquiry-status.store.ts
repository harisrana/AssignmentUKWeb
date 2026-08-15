import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { EnquiryStatusService } from './enquiry-status.service';
import { CreateEnquiryStatusRequest, EnquiryStatusOption, UpdateEnquiryStatusRequest } from '../models/enquiry-status.model';

/**
 * Signal-based store for the admin-configurable enquiry status catalog. Shared by the dashboard
 * (status dropdown/badges, active statuses only) and Settings (full management view, all statuses).
 */
@Injectable({ providedIn: 'root' })
export class EnquiryStatusStore {
  private readonly service = inject(EnquiryStatusService);

  /** Active statuses only — what the dashboard's status picker/badges use. */
  readonly statuses = signal<EnquiryStatusOption[]>([]);

  /** All statuses including deactivated ones — what the Settings management view uses. */
  readonly allStatuses = signal<EnquiryStatusOption[]>([]);

  readonly loading = signal(false);

  private readonly byName = computed(() => {
    const map = new Map<string, EnquiryStatusOption>();
    for (const status of [...this.statuses(), ...this.allStatuses()]) {
      map.set(status.name, status);
    }
    return map;
  });

  load(): void {
    this.loading.set(true);
    this.service.list(false).subscribe({
      next: (list) => {
        this.statuses.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadAll(): void {
    this.service.list(true).subscribe((list) => this.allStatuses.set(list));
  }

  lookup(name: string): EnquiryStatusOption | undefined {
    return this.byName().get(name);
  }

  create(payload: CreateEnquiryStatusRequest): Observable<EnquiryStatusOption> {
    return this.service.create(payload).pipe(tap(() => this.refresh()));
  }

  update(id: string, payload: UpdateEnquiryStatusRequest): Observable<EnquiryStatusOption> {
    return this.service.update(id, payload).pipe(tap(() => this.refresh()));
  }

  remove(id: string): Observable<void> {
    return this.service.remove(id).pipe(tap(() => this.refresh()));
  }

  moveUp(id: string): Observable<void> {
    return this.service.moveUp(id).pipe(tap(() => this.refresh()));
  }

  moveDown(id: string): Observable<void> {
    return this.service.moveDown(id).pipe(tap(() => this.refresh()));
  }

  private refresh(): void {
    this.load();
    this.loadAll();
  }
}
