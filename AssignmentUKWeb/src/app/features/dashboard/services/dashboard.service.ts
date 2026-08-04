import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { DashboardStats, RecentOrder } from '../models/dashboard.model';

/**
 * Dashboard data access. Falls back to representative mock data so the UI is
 * demonstrable without a live backend; swap `of(...)` for `this.get(...)`.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  getStats(): Observable<DashboardStats> {
    // return this.get<DashboardStats>(API_ENDPOINTS.dashboard.stats);
    return of<DashboardStats>({
      totalOrders: 12480,
      activeWriters: 999,
      revenue: 284500,
      satisfaction: 98.6,
    }).pipe(delay(300));
  }

  getRecentOrders(): Observable<RecentOrder[]> {
    return of<RecentOrder[]>([
      { id: 'AWK-10241', subject: 'Law Dissertation', student: 'Olivia B.', status: 'In Progress', dueDate: '2026-07-28' },
      { id: 'AWK-10240', subject: 'CIPD Level 5', student: 'Mohammed A.', status: 'Review', dueDate: '2026-07-25' },
      { id: 'AWK-10239', subject: 'Nursing Care Plan', student: 'Sophie L.', status: 'Delivered', dueDate: '2026-07-22' },
      { id: 'AWK-10238', subject: 'Business Strategy', student: 'James K.', status: 'Pending', dueDate: '2026-07-30' },
    ]).pipe(delay(300));
  }
}
