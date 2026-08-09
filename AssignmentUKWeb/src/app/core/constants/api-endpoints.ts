import { environment } from '../../../environments/environment';

/** The API is versioned via the URL path: `/api/v1/...`. */
const base = `${environment.apiUrl}/${environment.apiVersion}`;

/** Origin the API is served from (apiUrl minus its trailing `/api` path), used to resolve server-relative asset URLs like avatars. */
const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

/**
 * Resolves a server-relative asset path (e.g. `/uploads/xyz.png`) into an
 * absolute URL. Passes already-absolute URLs and `data:` URIs (e.g. avatars,
 * which the API returns as base64) through unchanged.
 */
export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }
  return /^(https?:|data:)/i.test(path) ? path : `${apiOrigin}${path}`;
}

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
  priceEstimates: {
    root: `${base}/price-estimates`,
  },
  chat: {
    sessions: `${base}/chat/sessions`,
    messages: (sessionId: string) => `${base}/chat/sessions/${sessionId}/messages`,
    agentMessages: (sessionId: string) => `${base}/chat/sessions/${sessionId}/agent-messages`,
    visitorName: (sessionId: string) => `${base}/chat/sessions/${sessionId}/visitor-name`,
    close: (sessionId: string) => `${base}/chat/sessions/${sessionId}/close`,
    hub: `${apiOrigin}/hubs/chat`,
  },
} as const;
