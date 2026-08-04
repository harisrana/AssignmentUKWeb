import { Injectable } from '@angular/core';

/**
 * Thin, testable wrapper around Web Storage.
 *
 * Security note: browser storage is vulnerable to XSS, so tokens stored here
 * are only as safe as the app's XSS posture (we rely on Angular's built-in
 * sanitisation + short-lived access tokens + httpOnly refresh cookies where the
 * backend supports them). `localStorage` is used when "remember me" is checked,
 * otherwise `sessionStorage` (cleared when the tab closes).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private persistent = true;

  /** Choose the backing store: true = localStorage, false = sessionStorage. */
  usePersistent(persistent: boolean): void {
    this.persistent = persistent;
  }

  private get store(): Storage {
    return this.persistent ? localStorage : sessionStorage;
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  set<T>(key: string, value: T): void {
    this.store.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
