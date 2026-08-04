import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { TokenService } from './token.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthTokens,
  RefreshTokenRequest,
} from '../models/auth.model';
import { User } from '../models/user.model';
import { decodeJwt, claimToArray } from '../../shared/utilities/jwt.util';

/**
 * Core authentication service.
 *
 * Owns the reactive "who is logged in" state (signals) that guards, the
 * interceptor and RBAC directives read synchronously. NgRx effects delegate the
 * actual HTTP work here, keeping a single source of truth for the session.
 */
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  private readonly tokenService = inject(TokenService);

  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(
    () => this._user() !== null && this.tokenService.isAccessTokenValid(),
  );
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly permissions = computed(() => this._user()?.permissions ?? []);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_ENDPOINTS.auth.login, request).pipe(
      tap((res) => {
        this.tokenService.setTokens(res, request.rememberMe ?? false);
        this._user.set(res.user);
      }),
    );
  }

  /**
   * Creates an account. The API issues a token pair on success, so a successful
   * registration opens the session immediately — no second login round-trip.
   */
  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_ENDPOINTS.auth.register, request).pipe(
      tap((res) => {
        this.tokenService.setTokens(res, false);
        this._user.set(res.user);
      }),
    );
  }

  refreshToken(): Observable<AuthTokens> {
    // The API re-validates the (expired) access token alongside the refresh
    // token, so both must be sent.
    const body: RefreshTokenRequest = {
      accessToken: this.tokenService.getAccessToken() ?? '',
      refreshToken: this.tokenService.getRefreshToken() ?? '',
    };
    return this.post<AuthTokens>(API_ENDPOINTS.auth.refresh, body).pipe(
      tap((tokens) => {
        // Preserve the remember-me choice implicitly via existing storage.
        this.tokenService.setTokens(tokens, this.tokenService.isPersistentSession());
      }),
    );
  }

  /** Fetch the current user profile (e.g. on app bootstrap / page refresh). */
  loadCurrentUser(): Observable<User> {
    return this.get<User>(API_ENDPOINTS.auth.me).pipe(tap((user) => this._user.set(user)));
  }

  logout(): Observable<void> {
    const body = { refreshToken: this.tokenService.getRefreshToken() };
    return this.post<void>(API_ENDPOINTS.auth.logout, body).pipe(tap(() => this.clearSession()));
  }

  /** Update the in-memory session user (e.g. after a profile save). */
  setUser(user: User): void {
    this._user.set(user);
  }

  /** Clear local session state without a server round-trip (e.g. token expiry). */
  clearSession(): void {
    this.tokenService.clear();
    this._user.set(null);
  }

  /**
   * Restore the user from a still-valid access token (optimistic bootstrap
   * before /me resolves). Returns true if a session was restored.
   */
  restoreFromToken(): boolean {
    const token = this.tokenService.getAccessToken();
    if (!token || !this.tokenService.isAccessTokenValid()) {
      return false;
    }
    const payload = decodeJwt(token);
    if (!payload) {
      return false;
    }
    this._user.set({
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name ?? '',
      lastName: payload.family_name ?? '',
      roles: claimToArray(payload.roles),
      permissions: claimToArray(payload.permissions),
      isActive: true,
    });
    return true;
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.roles().includes(r));
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.permissions().includes(p));
  }
}
