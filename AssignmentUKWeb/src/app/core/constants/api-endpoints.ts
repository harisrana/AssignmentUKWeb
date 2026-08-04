import { environment } from '../../../environments/environment';

/** The API is versioned via the URL path: `/api/v1/...`. */
const base = `${environment.apiUrl}/${environment.apiVersion}`;

/**
 * Centralised registry of every API endpoint used by the app.
 * Never hard-code URLs in services — reference them here.
 */
export const API_ENDPOINTS = {
  auth: {
    login: `${base}/auth/login`,
    register: `${base}/auth/register`,
    logout: `${base}/auth/logout`,
    refresh: `${base}/auth/refresh-token`,
    me: `${base}/auth/me`,
    forgotPassword: `${base}/auth/forgot-password`,
    resetPassword: `${base}/auth/reset-password`,
  },
  users: {
    root: `${base}/users`,
    byId: (id: string) => `${base}/users/${id}`,
  },
  roles: {
    root: `${base}/roles`,
    byId: (id: string) => `${base}/roles/${id}`,
  },
  permissions: {
    root: `${base}/permissions`,
  },
  profile: {
    root: `${base}/profile`,
    avatar: `${base}/profile/avatar`,
    changePassword: `${base}/profile/change-password`,
  },
  dashboard: {
    stats: `${base}/dashboard/stats`,
  },
  files: {
    upload: `${base}/files/upload`,
  },
} as const;
