import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PageQuery } from '../../../core/models/api-response.model';
import { CreateUserRequest, UpdateUserRequest, User } from '../../../core/models/user.model';

export const UserActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': props<{ query: PageQuery }>(),
    'Load Users Success': props<{ users: User[]; totalCount: number }>(),
    'Load Users Failure': props<{ error: string }>(),

    'Create User': props<{ request: CreateUserRequest }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: string }>(),

    'Update User': props<{ request: UpdateUserRequest }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: string }>(),

    'Delete User': props<{ id: string }>(),
    'Delete User Success': props<{ id: string }>(),
    'Delete User Failure': props<{ error: string }>(),

    'Set Query': props<{ query: Partial<PageQuery> }>(),
    'Clear Error': emptyProps(),
  },
});
