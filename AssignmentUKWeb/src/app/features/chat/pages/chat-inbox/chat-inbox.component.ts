import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatMessage, ChatSession } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chat-inbox',
  imports: [FormsModule, DatePipe, PageHeaderComponent],
  templateUrl: './chat-inbox.component.html',
})
export class ChatInboxComponent implements OnInit, OnDestroy {
  private readonly chat = inject(ChatService);

  protected readonly sessions = signal<ChatSession[]>([]);
  protected readonly selectedSessionId = signal<string | null>(null);
  protected readonly transcript = signal<ChatMessage[]>([]);
  protected readonly draft = signal('');
  protected readonly loading = signal(true);
  protected readonly liveUpdatesError = signal(false);
  protected readonly unreadCounts = signal<Record<string, number>>({});

  private readonly joinedSessions = new Set<string>();
  private readonly subscription = new Subscription();

  ngOnInit(): void {
    void this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  selectSession(session: ChatSession): void {
    this.selectedSessionId.set(session.id);
    this.transcript.set([]);
    this.setUnreadCount(session.id, 0);

    if (!this.joinedSessions.has(session.id)) {
      this.joinedSessions.add(session.id);
      this.chat.joinSession(session.id).catch(() => this.joinedSessions.delete(session.id));
    }

    this.chat.getMessages(session.id).subscribe((history) => this.transcript.set(history));
  }

  sendReply(): void {
    const sessionId = this.selectedSessionId();
    const text = this.draft().trim();
    if (!sessionId || !text) {
      return;
    }
    this.draft.set('');
    this.chat.sendAgentMessage(sessionId, text).subscribe();
  }

  closeSession(session: ChatSession, event: Event): void {
    event.stopPropagation();
    this.chat.closeSession(session.id).subscribe(() => {
      this.sessions.update((list) => list.filter((s) => s.id !== session.id));
      if (this.selectedSessionId() === session.id) {
        this.selectedSessionId.set(null);
        this.transcript.set([]);
      }
    });
  }

  private async init(): Promise<void> {
    // Load the session list over REST independently of the live-update
    // connection below, so a hub/auth failure never leaves the inbox stuck
    // on "Loading sessions…" forever.
    this.chat.getOpenSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
        for (const session of sessions) {
          this.chat.getMessages(session.id).subscribe((history) => {
            this.setUnreadCount(session.id, this.countTrailingUnread(history));
          });
        }
      },
      error: () => this.loading.set(false),
    });

    this.subscription.add(
      this.chat.messageReceived$.subscribe((message) => {
        if (message.chatSessionId === this.selectedSessionId()) {
          this.transcript.update((list) => [...list, message]);
          this.setUnreadCount(message.chatSessionId, 0);
        } else if (message.senderType === 'Visitor') {
          this.setUnreadCount(message.chatSessionId, (this.unreadCounts()[message.chatSessionId] ?? 0) + 1);
        }
        this.bumpSession(message.chatSessionId);
      }),
    );

    this.subscription.add(
      this.chat.sessionStarted$.subscribe((session) => {
        this.sessions.update((list) => [session, ...list.filter((s) => s.id !== session.id)]);
      }),
    );

    this.subscription.add(
      this.chat.sessionClosed$.subscribe((sessionId) => {
        this.sessions.update((list) => list.filter((s) => s.id !== sessionId));
        if (this.selectedSessionId() === sessionId) {
          this.selectedSessionId.set(null);
          this.transcript.set([]);
        }
      }),
    );

    try {
      await this.chat.connectAsAgent();
    } catch {
      // The session list above still works without live updates; surface a
      // banner instead of leaving the page silently non-live.
      this.liveUpdatesError.set(true);
    }
  }

  private setUnreadCount(sessionId: string, count: number): void {
    this.unreadCounts.update((counts) => ({ ...counts, [sessionId]: count }));
  }

  /** Visitor messages since the agent's last reply — a reasonable "unread" proxy without a read-receipt backend. */
  private countTrailingUnread(history: ChatMessage[]): number {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].senderType !== 'Visitor') {
        break;
      }
      count++;
    }
    return count;
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
