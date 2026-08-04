import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { UserActions } from './user.actions';
import { User } from '../../../core/models/user.model';
import { PageQuery } from '../../../core/models/api-response.model';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

export interface UsersState extends EntityState<User> {
  totalCount: number;
  query: PageQuery;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const userAdapter = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.lastName.localeCompare(b.lastName),
});

export const initialUsersState: UsersState = userAdapter.getInitialState({
  totalCount: 0,
  query: {
    pageIndex: 0,
    pageSize: APP_CONSTANTS.defaultPageSize,
    search: '',
    sortBy: '',
    sortDirection: 'asc',
  },
  loading: false,
  saving: false,
  error: null,
});

export const usersFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialUsersState,

    on(UserActions.loadUsers, (state, { query }) => ({ ...state, query, loading: true, error: null })),
    on(UserActions.loadUsersSuccess, (state, { users, totalCount }) =>
      userAdapter.setAll(users, { ...state, totalCount, loading: false }),
    ),
    on(UserActions.loadUsersFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(UserActions.createUser, UserActions.updateUser, (state) => ({ ...state, saving: true, error: null })),
    on(UserActions.createUserSuccess, (state, { user }) =>
      userAdapter.addOne(user, { ...state, saving: false, totalCount: state.totalCount + 1 }),
    ),
    on(UserActions.updateUserSuccess, (state, { user }) =>
      userAdapter.upsertOne(user, { ...state, saving: false }),
    ),
    on(
      UserActions.createUserFailure,
      UserActions.updateUserFailure,
      UserActions.deleteUserFailure,
      (state, { error }) => ({ ...state, saving: false, error }),
    ),

    on(UserActions.deleteUserSuccess, (state, { id }) =>
      userAdapter.removeOne(id, { ...state, totalCount: Math.max(0, state.totalCount - 1) }),
    ),

    on(UserActions.setQuery, (state, { query }) => ({ ...state, query: { ...state.query, ...query } })),
    on(UserActions.clearError, (state) => ({ ...state, error: null })),
  ),
});
