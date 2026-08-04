import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Role } from '../../../core/models/role.model';

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseApiService {
  list(): Observable<Role[]> {
    return this.get<Role[]>(API_ENDPOINTS.roles.root);
  }

  getById(id: string): Observable<Role> {
    return this.get<Role>(API_ENDPOINTS.roles.byId(id));
  }

  create(request: CreateRoleRequest): Observable<Role> {
    return this.post<Role>(API_ENDPOINTS.roles.root, request);
  }

  update(request: UpdateRoleRequest): Observable<Role> {
    return this.put<Role>(API_ENDPOINTS.roles.byId(request.id), request);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.roles.byId(id));
  }
}
