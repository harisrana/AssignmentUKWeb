import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '../../../core/models/user.model';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
    on(AuthActions.loginSuccess, (state, { response }) => ({
      ...state,
      user: response.user,
      loading: false,
      error: null,
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
    on(AuthActions.registerSuccess, (state, { response }) => ({
      ...state,
      user: response.user,
      loading: false,
      error: null,
    })),
    on(AuthActions.registerFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({ ...state, user })),
    on(AuthActions.loadCurrentUserFailure, (state, { error }) => ({ ...state, error })),

    on(AuthActions.logoutSuccess, (state) => ({ ...state, user: null })),
    on(AuthActions.clearError, (state) => ({ ...state, error: null })),
  ),
});

export const {
  name: authFeatureKey,
  reducer: authReducer,
  selectUser: selectAuthUser,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
} = authFeature;
