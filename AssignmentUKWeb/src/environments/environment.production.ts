export const environment = {
  production: true,
  name: 'production',
  apiUrl: 'https://api.assignmentwritings.uk/api',
  apiVersion: 'v1',
  appName: 'Assignment Writings UK',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ur'],
  auth: {
    tokenStorageKey: 'auk_access_token',
    refreshTokenStorageKey: 'auk_refresh_token',
    refreshSkewSeconds: 60,
  },
  session: {
    idleWarningMs: 13 * 60 * 1000,
    idleTimeoutMs: 2 * 60 * 1000,
  },
  logging: {
    level: 3, // ERROR only in production
    remote: true,
    remoteUrl: 'https://api.assignmentwritings.uk/api/logs',
  },
};
