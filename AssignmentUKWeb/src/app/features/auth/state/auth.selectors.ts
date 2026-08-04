import { createSelector } from '@ngrx/store';
import { authFeature } from './auth.reducer';

export const selectAuthUser = authFeature.selectUser;
export const selectAuthLoading = authFeature.selectLoading;
export const selectAuthError = authFeature.selectError;

export const selectIsAuthenticated = createSelector(selectAuthUser, (user) => user !== null);

export const selectUserRoles = createSelector(selectAuthUser, (user) => user?.roles ?? []);

export const selectUserPermissions = createSelector(
  selectAuthUser,
  (user) => user?.permissions ?? [],
);

export const selectUserFullName = createSelector(selectAuthUser, (user) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : '',
);
