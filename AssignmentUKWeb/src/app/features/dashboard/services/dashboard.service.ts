import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { DashboardStats } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>(API_ENDPOINTS.dashboard.stats);
  }
}
