/** Application-wide constant values. */
export const APP_CONSTANTS = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  debounceMs: 300,
  maxUploadSizeMb: 10,
  acceptedUploadTypes: ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'],
} as const;

/** Well-known application roles. */
export const ROLES = {
  admin: 'Admin',
  manager: 'Manager',
  writer: 'Writer',
  customer: 'Customer',
} as const;

/**
 * Permission keys — must match backend policy names.
 * Convention: `<resource>.<action>`.
 */
export const PERMISSIONS = {
  usersView: 'users.view',
  usersCreate: 'users.create',
  usersEdit: 'users.edit',
  usersDelete: 'users.delete',
  rolesView: 'roles.view',
  rolesManage: 'roles.manage',
  permissionsView: 'permissions.view',
  settingsManage: 'settings.manage',
  dashboardView: 'dashboard.view',
  chatManage: 'chat.manage',
} as const;
