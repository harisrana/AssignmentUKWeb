import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { ApiErrorService } from '../../../core/services/api-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

export const loginEffect = createEffect(
  (actions$ = inject(Actions), auth = inject(AuthService), apiError = inject(ApiErrorService)) =>
    actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ request, returnUrl }) =>
        auth.login(request).pipe(
          map((response) => AuthActions.loginSuccess({ response, returnUrl })),
          catchError((error: unknown) =>
            of(
              AuthActions.loginFailure({
                error:
                  error instanceof HttpErrorResponse
                    ? apiError.toUserMessage(error)
                    : 'Login failed. Please try again.',
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loginSuccessRedirectEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ returnUrl }) => {
        notify.success('Welcome back!');
        void router.navigateByUrl(returnUrl || '/app/dashboard');
      }),
    ),
  { functional: true, dispatch: false },
);

export const registerEffect = createEffect(
  (actions$ = inject(Actions), auth = inject(AuthService), apiError = inject(ApiErrorService)) =>
    actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ request }) =>
        auth.register(request).pipe(
          map((response) => AuthActions.registerSuccess({ response })),
          catchError((error: unknown) =>
            of(
              AuthActions.registerFailure({
                error:
                  error instanceof HttpErrorResponse
                    ? apiError.toUserMessage(error)
                    : 'Registration failed. Please try again.',
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const registerSuccessRedirectEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => {
        notify.success('Your account is ready. Welcome aboard!');
        void router.navigateByUrl('/app/dashboard');
      }),
    ),
  { functional: true, dispatch: false },
);

export const logoutEffect = createEffect(
  (actions$ = inject(Actions), auth = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        auth.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          // Even if the server call fails, clear the local session.
          catchError(() => {
            auth.clearSession();
            return of(AuthActions.logoutSuccess());
          }),
        ),
      ),
    ),
  { functional: true },
);

export const logoutRedirectEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => void router.navigate(['/auth/login'])),
    ),
  { functional: true, dispatch: false },
);

export const loadCurrentUserEffect = createEffect(
  (actions$ = inject(Actions), auth = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      switchMap(() =>
        auth.loadCurrentUser().pipe(
          map((user) => AuthActions.loadCurrentUserSuccess({ user })),
          catchError((error: unknown) =>
            of(
              AuthActions.loadCurrentUserFailure({
                error: error instanceof Error ? error.message : 'Failed to load user',
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
