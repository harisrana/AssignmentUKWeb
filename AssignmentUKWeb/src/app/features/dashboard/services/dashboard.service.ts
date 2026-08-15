import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult } from '../../../core/models/api-response.model';
import { DashboardStats, EnquiryStatus, EnquiryStatusHistoryEntry, RecentEnquiry } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>(API_ENDPOINTS.dashboard.stats);
  }

  getEnquiries(pageIndex: number, pageSize: number): Observable<PagedResult<RecentEnquiry>> {
    return this.get<PagedResult<RecentEnquiry>>(API_ENDPOINTS.dashboard.enquiries, { pageIndex, pageSize });
  }

  updateEnquiryStatus(id: string, status: EnquiryStatus): Observable<{ status: EnquiryStatus }> {
    return this.patch<{ status: EnquiryStatus }>(API_ENDPOINTS.priceEstimates.status(id), { status });
  }

  getEnquiryStatusHistory(id: string): Observable<EnquiryStatusHistoryEntry[]> {
    return this.get<EnquiryStatusHistoryEntry[]>(API_ENDPOINTS.priceEstimates.statusHistory(id));
  }
}
