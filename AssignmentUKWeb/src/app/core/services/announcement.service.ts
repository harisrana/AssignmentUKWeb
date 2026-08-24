import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../models/announcement.model';

/** Admin-configurable site announcements (Configuration → Announcements) shown in a banner on the public site. */
@Injectable({ providedIn: 'root' })
export class AnnouncementService extends BaseApiService {
  list(includeInactive = false): Observable<Announcement[]> {
    return this.get<Announcement[]>(API_ENDPOINTS.announcements.root, { includeInactive });
  }

  /** Active announcements for the public banner. No authentication required. */
  listActive(): Observable<Announcement[]> {
    return this.get<Announcement[]>(API_ENDPOINTS.announcements.active);
  }

  create(payload: CreateAnnouncementRequest): Observable<Announcement> {
    return this.post<Announcement>(API_ENDPOINTS.announcements.root, payload);
  }

  update(id: string, payload: UpdateAnnouncementRequest): Observable<Announcement> {
    return this.put<Announcement>(API_ENDPOINTS.announcements.byId(id), payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.announcements.byId(id));
  }
}
