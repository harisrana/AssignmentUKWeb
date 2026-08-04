import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { PERMISSIONS } from '../constants/app.constants';
import { ApiResponse } from '../models/api-response.model';
import { LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

/**
 * Locks the login contract against the API: URL shape, response envelope, token
 * persistence and the session signals that guards read.
 */
describe('AuthService', () => {
  let auth: AuthService;
  let tokens: TokenService;
  let http: HttpTestingController;

  /** Header/payload/signature of a token whose `exp` is an hour out. */
  function fakeJwt(payload: Record<string, unknown>): string {
    const encode = (value: unknown) =>
      btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      ...payload,
    })}.signature`;
  }

  const accessToken = fakeJwt({
    sub: '11111111-1111-1111-1111-111111111111',
    email: 'admin@assignmentuk.local',
    given_name: 'System',
    family_name: 'Administrator',
    roles: 'Admin',
    permissions: [PERMISSIONS.dashboardView, PERMISSIONS.usersView],
  });

  const user: User = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@assignmentuk.local',
    firstName: 'System',
    lastName: 'Administrator',
    roles: ['Admin'],
    permissions: [PERMISSIONS.dashboardView, PERMISSIONS.usersView],
    isActive: true,
  };

  const loginEnvelope: ApiResponse<LoginResponse> = {
    success: true,
    message: '',
    data: { accessToken, refreshToken: 'refresh-token-value', expiresIn: 900, tokenType: 'Bearer', user },
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    tokens = TestBed.inject(TokenService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts to the versioned auth/login route without an Authorization header', () => {
    auth.login({ email: 'admin@assignmentuk.local', password: 'Admin@12345' }).subscribe();

    const req = http.expectOne(API_ENDPOINTS.auth.login);
    expect(req.request.method).toBe('POST');
    expect(req.request.url).toContain('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.body).toEqual({ email: 'admin@assignmentuk.local', password: 'Admin@12345' });
    req.flush(loginEnvelope);
  });

  it('unwraps the envelope, persists tokens and opens the session', () => {
    let response: LoginResponse | undefined;
    auth
      .login({ email: 'admin@assignmentuk.local', password: 'Admin@12345', rememberMe: true })
      .subscribe((res) => (response = res));
    http.expectOne(API_ENDPOINTS.auth.login).flush(loginEnvelope);

    expect(response?.user.email).toBe('admin@assignmentuk.local');
    expect(tokens.getAccessToken()).toBe(accessToken);
    expect(tokens.getRefreshToken()).toBe('refresh-token-value');
    expect(tokens.isPersistentSession()).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.hasRole('Admin')).toBe(true);
    expect(auth.hasPermission(PERMISSIONS.dashboardView)).toBe(true);
  });

  it('keeps a non-remembered session out of localStorage', () => {
    auth
      .login({ email: 'admin@assignmentuk.local', password: 'Admin@12345', rememberMe: false })
      .subscribe();
    http.expectOne(API_ENDPOINTS.auth.login).flush(loginEnvelope);

    expect(tokens.isPersistentSession()).toBe(false);
    expect(sessionStorage.getItem('auk_access_token')).toBe(accessToken);
  });

  it('leaves no session behind when the API rejects the credentials', () => {
    let status: number | undefined;
    auth
      .login({ email: 'admin@assignmentuk.local', password: 'wrong' })
      .subscribe({ error: (err) => (status = err.status) });
    http
      .expectOne(API_ENDPOINTS.auth.login)
      .flush(
        { success: false, message: 'Invalid email or password.' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(status).toBe(401);
    expect(tokens.getAccessToken()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('restores roles and permissions from the access token claims', () => {
    tokens.setTokens({ accessToken, refreshToken: 'refresh-token-value', expiresIn: 900 }, true);

    expect(auth.restoreFromToken()).toBe(true);
    expect(auth.user()?.firstName).toBe('System');
    expect(auth.roles()).toEqual(['Admin']);
    expect(auth.hasAllPermissions([PERMISSIONS.dashboardView, PERMISSIONS.usersView])).toBe(true);
  });

  it('sends both tokens when refreshing, because the API re-validates the access token', () => {
    tokens.setTokens({ accessToken, refreshToken: 'refresh-token-value', expiresIn: 900 }, true);
    auth.refreshToken().subscribe();

    const req = http.expectOne(API_ENDPOINTS.auth.refresh);
    expect(req.request.body).toEqual({ accessToken, refreshToken: 'refresh-token-value' });
    req.flush({ success: true, message: '', data: { accessToken, refreshToken: 'rotated', expiresIn: 900 } });
    expect(tokens.getRefreshToken()).toBe('rotated');
  });

  it('sends the refresh token on logout and clears the session', () => {
    tokens.setTokens({ accessToken, refreshToken: 'refresh-token-value', expiresIn: 900 }, true);
    auth.logout().subscribe();

    const req = http.expectOne(API_ENDPOINTS.auth.logout);
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token-value' });
    req.flush({ success: true, message: 'Signed out.', data: null });

    expect(tokens.getAccessToken()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('loads the current user from auth/me with the bearer token attached', () => {
    tokens.setTokens({ accessToken, refreshToken: 'refresh-token-value', expiresIn: 900 }, true);
    auth.loadCurrentUser().subscribe();

    const req = http.expectOne(API_ENDPOINTS.auth.me);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${accessToken}`);
    req.flush({ success: true, message: '', data: user });

    expect(auth.user()?.email).toBe('admin@assignmentuk.local');
  });
});
