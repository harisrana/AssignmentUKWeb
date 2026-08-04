import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { UserActions } from './user.actions';
import { UserService } from '../services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiErrorService } from '../../../core/services/api-error.service';

function toMessage(error: unknown, apiError: ApiErrorService, fallback: string): string {
  return error instanceof HttpErrorResponse ? apiError.toUserMessage(error) : fallback;
}

export const loadUsersEffect = createEffect(
  (actions$ = inject(Actions), service = inject(UserService), apiError = inject(ApiErrorService)) =>
    actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(({ query }) =>
        service.list(query).pipe(
          map((res) =>
            UserActions.loadUsersSuccess({
              users: res.data.items,
              totalCount: res.data.totalCount,
            }),
          ),
          catchError((error: unknown) =>
            of(UserActions.loadUsersFailure({ error: toMessage(error, apiError, 'Failed to load users') })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const createUserEffect = createEffect(
  (actions$ = inject(Actions), service = inject(UserService), apiError = inject(ApiErrorService)) =>
    actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap(({ request }) =>
        service.create(request).pipe(
          map((user) => UserActions.createUserSuccess({ user })),
          catchError((error: unknown) =>
            of(UserActions.createUserFailure({ error: toMessage(error, apiError, 'Failed to create user') })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const updateUserEffect = createEffect(
  (actions$ = inject(Actions), service = inject(UserService), apiError = inject(ApiErrorService)) =>
    actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ request }) =>
        service.update(request).pipe(
          map((user) => UserActions.updateUserSuccess({ user })),
          catchError((error: unknown) =>
            of(UserActions.updateUserFailure({ error: toMessage(error, apiError, 'Failed to update user') })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const deleteUserEffect = createEffect(
  (actions$ = inject(Actions), service = inject(UserService), apiError = inject(ApiErrorService)) =>
    actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(({ id }) =>
        service.remove(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error: unknown) =>
            of(UserActions.deleteUserFailure({ error: toMessage(error, apiError, 'Failed to delete user') })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const userMutationSuccessEffect = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        UserActions.createUserSuccess,
        UserActions.updateUserSuccess,
        UserActions.deleteUserSuccess,
      ),
      tap(() => notify.success('Changes saved successfully.')),
    ),
  { functional: true, dispatch: false },
);
