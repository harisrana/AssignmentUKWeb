import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { UpdateProfileRequest, User } from '../models/user.model';

/** Handles the authenticated user's own profile updates (details + avatar). */
@Injectable({ providedIn: 'root' })
export class ProfileService extends BaseApiService {
  updateProfile(payload: UpdateProfileRequest): Observable<User> {
    return this.put<User>(API_ENDPOINTS.profile.root, payload);
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<User>(API_ENDPOINTS.profile.avatar, formData);
  }
}
