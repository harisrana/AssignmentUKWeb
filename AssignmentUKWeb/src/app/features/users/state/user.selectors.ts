import { createSelector } from '@ngrx/store';
import { usersFeature, userAdapter } from './user.reducer';

const { selectAll, selectTotal } = userAdapter.getSelectors();

export const selectUsersState = usersFeature.selectUsersState;

export const selectAllUsers = createSelector(selectUsersState, selectAll);
export const selectUsersLoaded = createSelector(selectUsersState, selectTotal);
export const selectUsersLoading = usersFeature.selectLoading;
export const selectUsersSaving = usersFeature.selectSaving;
export const selectUsersError = usersFeature.selectError;
export const selectUsersTotalCount = usersFeature.selectTotalCount;
export const selectUsersQuery = usersFeature.selectQuery;
