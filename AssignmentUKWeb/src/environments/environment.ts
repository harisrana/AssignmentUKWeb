/**
 * Base (fallback) environment.
 * `environment.development.ts` and `environment.production.ts` replace this
 * file at build time via the `fileReplacements` entry in angular.json.
 */
export const environment = {
  production: false,
  name: 'default',
  apiUrl: 'https://api.assignmentwritings.uk/api',
  apiVersion: 'v1',
  appName: 'Assignment Writings UK',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ur'],
  auth: {
    tokenStorageKey: 'auk_access_token',
    refreshTokenStorageKey: 'auk_refresh_token',
    /** Refresh the access token this many seconds before it expires. */
    refreshSkewSeconds: 60,
  },
  session: {
    /** Idle time (ms) before the session-timeout warning is shown. */
    idleWarningMs: 13 * 60 * 1000,
    /** Additional time (ms) after the warning before auto-logout. */
    idleTimeoutMs: 2 * 60 * 1000,
  },
  logging: {
    /** 0=DEBUG 1=INFO 2=WARN 3=ERROR 4=OFF */
    level: 0,
    remote: false,
    remoteUrl: '',
  },
};
