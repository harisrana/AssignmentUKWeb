import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { ApiResponse, PageQuery, PagedResult } from '../../../core/models/api-response.model';
import { CreateUserRequest, UpdateUserRequest, User } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  list(query: PageQuery): Observable<ApiResponse<PagedResult<User>>> {
    return this.getRaw<PagedResult<User>>(API_ENDPOINTS.users.root, {
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      search: query.search ?? '',
      sortBy: query.sortBy ?? '',
      sortDirection: query.sortDirection ?? '',
    });
  }

  getById(id: string): Observable<User> {
    return this.get<User>(API_ENDPOINTS.users.byId(id));
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.post<User>(API_ENDPOINTS.users.root, request);
  }

  update(request: UpdateUserRequest): Observable<User> {
    return this.put<User>(API_ENDPOINTS.users.byId(request.id), request);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.users.byId(id));
  }
}
