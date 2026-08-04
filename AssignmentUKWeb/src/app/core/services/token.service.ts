import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { APP_CONFIG } from '../configurations/app-config.token';
import { AuthTokens } from '../models/auth.model';
import { isTokenExpired, getTokenExpiry } from '../../shared/utilities/jwt.util';

/**
 * Single source of truth for reading/writing JWT tokens.
 * Storage backend (local vs session) is chosen based on "remember me".
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly storage = inject(StorageService);
  private readonly config = inject(APP_CONFIG);

  private get accessKey(): string {
    return this.config.auth.tokenStorageKey;
  }
  private get refreshKey(): string {
    return this.config.auth.refreshTokenStorageKey;
  }

  setTokens(tokens: AuthTokens, remember: boolean): void {
    this.storage.usePersistent(remember);
    this.storage.set(this.accessKey, tokens.accessToken);
    this.storage.set(this.refreshKey, tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return this.storage.get<string>(this.accessKey);
  }

  getRefreshToken(): string | null {
    return this.storage.get<string>(this.refreshKey);
  }

  clear(): void {
    this.storage.remove(this.accessKey);
    this.storage.remove(this.refreshKey);
  }

  isAccessTokenValid(): boolean {
    return !isTokenExpired(this.getAccessToken());
  }

  /** True when the session was persisted to localStorage ("remember me"). */
  isPersistentSession(): boolean {
    return localStorage.getItem(this.accessKey) !== null;
  }

  /** ms until the access token expires (accounting for the configured skew). */
  msUntilExpiry(): number {
    const token = this.getAccessToken();
    const expiry = token ? getTokenExpiry(token) : null;
    if (expiry === null) {
      return 0;
    }
    return expiry - Date.now() - this.config.auth.refreshSkewSeconds * 1000;
  }
}
