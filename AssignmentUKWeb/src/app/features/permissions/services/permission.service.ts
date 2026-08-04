import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Permission } from '../../../core/models/role.model';

@Injectable({ providedIn: 'root' })
export class PermissionService extends BaseApiService {
  list(): Observable<Permission[]> {
    return this.get<Permission[]>(API_ENDPOINTS.permissions.root);
  }
}
