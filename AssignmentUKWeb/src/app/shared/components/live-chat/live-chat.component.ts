import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { StorageService } from '../../../core/services/storage.service';
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

  protected readonly open = signal(false);
  protected readonly draft = signal('');
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly connecting = signal(false);

  private sessionId: string | null = null;
  private initialized = false;
  private readonly subscription = new Subscription();

  toggle(): void {
    this.open.update((v) => !v);
    if (this.open() && !this.initialized) {
      this.initialized = true;
      void this.init();
    }
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
          }
        }),
      );

      const existingSessionId = this.storage.get<string>(SESSION_STORAGE_KEY);

      if (existingSessionId) {
        this.sessionId = existingSessionId;
        await this.chat.joinSession(existingSessionId);
        this.chat.getMessages(existingSessionId).subscribe({
          next: (history) => this.messages.set(history),
          error: () => this.startNewSession(),
        });
      } else {
        this.startNewSession();
      }
    } finally {
      this.connecting.set(false);
    }
  }

  private startNewSession(): void {
    this.chat.createSession().subscribe((session) => {
      this.sessionId = session.id;
      this.storage.set(SESSION_STORAGE_KEY, session.id);
      this.messages.set(session.messages);
      void this.chat.joinSession(session.id);
    });
  }
}
