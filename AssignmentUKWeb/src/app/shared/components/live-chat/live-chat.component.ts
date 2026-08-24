import { Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { LiveChatWidgetService } from '../../../core/services/live-chat-widget.service';
import { ChatMessage } from '../../../core/models/chat.model';

const SESSION_STORAGE_KEY = 'auk_chat_session_id';

/**
 * Public-facing live chat widget. Backed by a real SignalR connection
 * (ChatService) — the session id is kept in localStorage so a visitor's
 * conversation survives page reloads/navigation.
 */
@Component({
  selector: 'app-live-chat',
  imports: [FormsModule],
  templateUrl: './live-chat.component.html',
})
export class LiveChatComponent implements OnDestroy {
  private readonly chat = inject(ChatService);
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);
  private readonly widget = inject(LiveChatWidgetService);

  protected readonly open = this.widget.open;
  protected readonly draft = signal('');
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly connecting = signal(false);

  private sessionId: string | null = null;
  private initialized = false;
  private readonly subscription = new Subscription();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    // Opening can be triggered from outside this component too (e.g. a "Contact Us" CTA
    // via LiveChatWidgetService), so initialize the connection on the first open regardless
    // of who triggered it, not just clicks on this component's own toggle button.
    effect(() => {
      if (this.open() && !this.initialized) {
        this.initialized = true;
        void this.init();
      }
    });
  }

  toggle(): void {
    this.widget.toggle();
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || !this.sessionId) {
      return;
    }
    this.draft.set('');
    this.chat.sendVisitorMessage(this.sessionId, text).subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private async init(): Promise<void> {
    this.connecting.set(true);
    try {
      await this.chat.connectAsVisitor();

      this.subscription.add(
        this.chat.messageReceived$.subscribe((message) => {
          if (message.chatSessionId === this.sessionId) {
            this.messages.update((list) => [...list, message]);
            this.scrollToBottom();
          }
        }),
      );

      const existingSessionId = this.storage.get<string>(SESSION_STORAGE_KEY);

      if (existingSessionId) {
        this.sessionId = existingSessionId;
        await this.chat.joinSession(existingSessionId);
        this.chat.getMessages(existingSessionId).subscribe({
          next: (history) => {
            this.messages.set(history);
            this.scrollToBottom();
          },
          error: () => this.startNewSession(),
        });
        // The cached session may predate the visitor logging in (or logging in as
        // someone else), so re-sync the display name every time it's reused.
        this.syncVisitorName(existingSessionId);
      } else {
        this.startNewSession();
      }
    } finally {
      this.connecting.set(false);
    }
  }

  private startNewSession(): void {
    const visitorName = this.currentVisitorName();

    this.chat.createSession(visitorName ?? undefined).subscribe((session) => {
      this.sessionId = session.id;
      this.storage.set(SESSION_STORAGE_KEY, session.id);
      this.messages.set(session.messages);
      this.scrollToBottom();
      void this.chat.joinSession(session.id);
    });
  }

  private syncVisitorName(sessionId: string): void {
    const visitorName = this.currentVisitorName();
    if (visitorName) {
      this.chat.updateVisitorName(sessionId, visitorName).subscribe();
    }
  }

  private currentVisitorName(): string | null {
    const user = this.auth.user();
    if (!user) {
      return null;
    }
    return user.fullName || `${user.firstName} ${user.lastName}`.trim() || null;
  }

  /** Deferred to let the `@for` update flush before measuring scrollHeight. */
  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
