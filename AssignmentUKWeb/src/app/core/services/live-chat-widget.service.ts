import { Injectable, signal } from '@angular/core';

/**
 * Open/closed state for the floating live chat widget, shared so any page
 * (e.g. a "Contact Us" CTA) can open it without depending on the widget component directly.
 */
@Injectable({ providedIn: 'root' })
export class LiveChatWidgetService {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  openWidget(): void {
    this.open.set(true);
  }
}
