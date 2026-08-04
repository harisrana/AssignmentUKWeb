import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ request: LoginRequest; returnUrl?: string }>(),
    'Login Success': props<{ response: LoginResponse; returnUrl?: string }>(),
    'Login Failure': props<{ error: string }>(),

    Register: props<{ request: RegisterRequest }>(),
    'Register Success': props<{ response: LoginResponse }>(),
    'Register Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),

    'Load Current User': emptyProps(),
    'Load Current User Success': props<{ user: User }>(),
    'Load Current User Failure': props<{ error: string }>(),

    'Restore Session': emptyProps(),
    'Clear Error': emptyProps(),
  },
});
