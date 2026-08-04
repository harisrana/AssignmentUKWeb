export const environment = {
  production: false,
  name: 'development',
  apiUrl: 'http://localhost:5074/api',
  apiVersion: 'v1',
  appName: 'Assignment Writings UK (Dev)',
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
    level: 0, // DEBUG
    remote: false,
    remoteUrl: '',
  },
};
