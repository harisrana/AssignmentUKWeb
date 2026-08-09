import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatService } from './chat.service';
import { StorageService } from './storage.service';
import { ChatMessage, ChatSession } from '../models/chat.model';

const LAST_READ_STORAGE_KEY = 'auk_chat_last_read';

/**
 * Root-level source of truth for open chat sessions + unread counts, shared by
 * the navbar notification bell and the chat inbox page so they don't each run
 * their own SignalR subscription/session list.
 */
@Injectable({ providedIn: 'root' })
export class ChatUnreadService {
  private readonly chat = inject(ChatService);
  private readonly storage = inject(StorageService);

  readonly sessions = signal<ChatSession[]>([]);
  readonly unreadCounts = signal<Record<string, number>>({});
  readonly messagePreviews = signal<Record<string, string>>({});
  readonly loading = signal(true);
  readonly liveUpdatesError = signal(false);

  /** The session currently open in the inbox page, if any — new messages for it are auto-marked read. */
  readonly activeSessionId = signal<string | null>(null);

  readonly totalUnread = computed(() => Object.values(this.unreadCounts()).reduce((sum, n) => sum + n, 0));

  readonly unreadSessions = computed(() =>
    this.sessions()
      .filter((s) => (this.unreadCounts()[s.id] ?? 0) > 0)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
  );

  private initialized = false;

  /** Idempotent — safe for every consumer (bell, inbox page) to call on init. */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.chat.getOpenSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
        for (const session of sessions) {
          this.chat.getMessages(session.id).subscribe((history) => {
            this.setUnreadCount(session.id, this.countUnread(session.id, history));
            const last = history[history.length - 1];
            if (last) {
              this.setPreview(session.id, last.text);
            }
          });
        }
      },
      error: () => this.loading.set(false),
    });

    this.chat.messageReceived$.subscribe((message) => {
      this.setPreview(message.chatSessionId, message.text);
      if (message.chatSessionId === this.activeSessionId()) {
        this.markRead(message.chatSessionId);
      } else if (message.senderType === 'Visitor') {
        this.setUnreadCount(message.chatSessionId, (this.unreadCounts()[message.chatSessionId] ?? 0) + 1);
      }
      this.bumpSession(message.chatSessionId);
    });

    this.chat.sessionStarted$.subscribe((session) => {
      this.sessions.update((list) => [session, ...list.filter((s) => s.id !== session.id)]);
    });

    this.chat.sessionClosed$.subscribe((sessionId) => {
      this.removeSession(sessionId);
    });

    try {
      await this.chat.connectAsAgent();
    } catch {
      this.liveUpdatesError.set(true);
    }
  }

  /** Marks the session read (if any) and tracks it as the one currently open in the inbox. */
  setActiveSession(sessionId: string | null): void {
    this.activeSessionId.set(sessionId);
    if (sessionId) {
      this.markRead(sessionId);
    }
  }

  removeSession(sessionId: string): void {
    this.sessions.update((list) => list.filter((s) => s.id !== sessionId));
    this.setUnreadCount(sessionId, 0);
    this.messagePreviews.update((previews) => {
      const { [sessionId]: _removed, ...rest } = previews;
      return rest;
    });
  }

  private setUnreadCount(sessionId: string, count: number): void {
    this.unreadCounts.update((counts) => ({ ...counts, [sessionId]: count }));
  }

  private setPreview(sessionId: string, text: string): void {
    this.messagePreviews.update((previews) => ({ ...previews, [sessionId]: text }));
  }

  private markRead(sessionId: string): void {
    this.setUnreadCount(sessionId, 0);
    const map = this.storage.get<Record<string, string>>(LAST_READ_STORAGE_KEY) ?? {};
    map[sessionId] = new Date().toISOString();
    this.storage.set(LAST_READ_STORAGE_KEY, map);
  }

  private getLastRead(sessionId: string): Date | null {
    const map = this.storage.get<Record<string, string>>(LAST_READ_STORAGE_KEY) ?? {};
    const iso = map[sessionId];
    return iso ? new Date(iso) : null;
  }

  /** Visitor messages since the agent last opened this session — persisted so unread state survives a refresh. */
  private countUnread(sessionId: string, history: ChatMessage[]): number {
    const lastReadAt = this.getLastRead(sessionId);
    return history.filter(
      (m) => m.senderType === 'Visitor' && (!lastReadAt || new Date(m.createdDate) > lastReadAt),
    ).length;
  }

  private bumpSession(sessionId: string): void {
    this.sessions.update((list) => {
      const match = list.find((s) => s.id === sessionId);
      if (!match) {
        return list;
      }
      const updated = { ...match, lastMessageAt: new Date().toISOString() };
      return [updated, ...list.filter((s) => s.id !== sessionId)];
    });
  }
}
