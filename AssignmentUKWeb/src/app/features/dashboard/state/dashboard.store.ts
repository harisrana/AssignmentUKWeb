import { Injectable, inject, signal } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats, RecentOrder } from '../models/dashboard.model';

/**
 * Lightweight signal-based store for the dashboard feature. (NgRx is used for
 * cross-cutting/entity state such as auth and users; a local signal store is a
 * pragmatic choice for a read-only view like this.)
 */
@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly service = inject(DashboardService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly recentOrders = signal<RecentOrder[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.service.getStats().subscribe((stats) => {
      this.stats.set(stats);
      this.loading.set(false);
    });
    this.service.getRecentOrders().subscribe((orders) => this.recentOrders.set(orders));
  }
}
