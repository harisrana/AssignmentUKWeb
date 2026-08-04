import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'auk_theme';

/**
 * Light/dark theme switcher. Toggles the `.dark` / `.light` class on <html>
 * (Tailwind darkMode: 'class' + Material dark theme both key off this).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  private readonly _theme = signal<ThemeMode>(this.resolveInitial());
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const mode = this._theme();
      const html = this.doc.documentElement;
      html.classList.toggle('dark', mode === 'dark');
      html.classList.toggle('light', mode === 'light');
      this.storage.set(THEME_KEY, mode);
    });
  }

  toggle(): void {
    this._theme.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  set(mode: ThemeMode): void {
    this._theme.set(mode);
  }

  private resolveInitial(): ThemeMode {
    const saved = this.storage.get<ThemeMode>(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
