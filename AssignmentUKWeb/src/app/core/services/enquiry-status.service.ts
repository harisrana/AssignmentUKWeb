import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CreateEnquiryStatusRequest, EnquiryStatusOption, UpdateEnquiryStatusRequest } from '../models/enquiry-status.model';

/** Admin-configurable status catalog for the enquiry workflow (Settings → Enquiry Statuses). */
@Injectable({ providedIn: 'root' })
export class EnquiryStatusService extends BaseApiService {
  list(includeInactive = false): Observable<EnquiryStatusOption[]> {
    return this.get<EnquiryStatusOption[]>(API_ENDPOINTS.enquiryStatuses.root, { includeInactive });
  }

  create(payload: CreateEnquiryStatusRequest): Observable<EnquiryStatusOption> {
    return this.post<EnquiryStatusOption>(API_ENDPOINTS.enquiryStatuses.root, payload);
  }

  update(id: string, payload: UpdateEnquiryStatusRequest): Observable<EnquiryStatusOption> {
    return this.put<EnquiryStatusOption>(API_ENDPOINTS.enquiryStatuses.byId(id), payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.enquiryStatuses.byId(id));
  }

  moveUp(id: string): Observable<void> {
    return this.post<void>(API_ENDPOINTS.enquiryStatuses.moveUp(id), {});
  }

  moveDown(id: string): Observable<void> {
    return this.post<void>(API_ENDPOINTS.enquiryStatuses.moveDown(id), {});
  }
}
