import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../../../core/models/user.model';

/**
 * Resolves a single user before a detail/edit route activates, so the page
 * renders with data already present (no flash of empty state).
 */
export const userResolver: ResolveFn<User | null> = (route) => {
  const service = inject(UserService);
  const id = route.paramMap.get('id');
  if (!id) {
    return of(null);
  }
  return service.getById(id).pipe(catchError(() => of(null)));
};
