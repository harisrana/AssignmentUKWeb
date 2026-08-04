import { Injectable, computed, signal } from '@angular/core';

/**
 * Tracks the number of in-flight HTTP requests so the global spinner can be
 * shown while any are pending. Uses a counter (not a boolean) so overlapping
 * requests don't hide the spinner prematurely.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);

  readonly isLoading = computed(() => this.pending() > 0);

  show(): void {
    this.pending.update((n) => n + 1);
  }

  hide(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  reset(): void {
    this.pending.set(0);
  }
}
