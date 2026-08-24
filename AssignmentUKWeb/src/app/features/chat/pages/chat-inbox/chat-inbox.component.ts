import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatUnreadService } from '../../../../core/services/chat-unread.service';
import { ChatMessage, ChatSession } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chat-inbox',
  imports: [FormsModule, DatePipe, PageHeaderComponent],
  templateUrl: './chat-inbox.component.html',
})
export class ChatInboxComponent implements OnInit, OnDestroy {
  private readonly chat = inject(ChatService);
  private readonly route = inject(ActivatedRoute);
  protected readonly chatUnread = inject(ChatUnreadService);

  protected readonly sessions = this.chatUnread.sessions;
  protected readonly unreadCounts = this.chatUnread.unreadCounts;
  protected readonly loading = this.chatUnread.loading;
  protected readonly liveUpdatesError = this.chatUnread.liveUpdatesError;

  protected readonly selectedSessionId = signal<string | null>(null);
  protected readonly transcript = signal<ChatMessage[]>([]);
  protected readonly draft = signal('');

  private readonly joinedSessions = new Set<string>();
  private readonly subscription = new Subscription();
  private readonly sessions$ = toObservable(this.chatUnread.sessions);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    void this.chatUnread.init();

    this.subscription.add(
      this.chat.messageReceived$.subscribe((message) => {
        if (message.chatSessionId === this.selectedSessionId()) {
          this.transcript.update((list) => [...list, message]);
          this.scrollToBottom();
        }
      }),
    );

    this.subscription.add(
      this.chat.sessionClosed$.subscribe((sessionId) => {
        if (this.selectedSessionId() === sessionId) {
          this.selectedSessionId.set(null);
          this.transcript.set([]);
        }
      }),
    );

    // Re-evaluated whenever the `sessionId` query param OR the session list changes — the
    // inbox component instance is reused when only query params change (same route), so
    // this can't be a one-time snapshot read in ngOnInit.
    this.subscription.add(
      combineLatest([this.route.queryParamMap, this.sessions$]).subscribe(
        ([params, sessions]) => {
          const targetSessionId = params.get('sessionId');
          if (!targetSessionId || targetSessionId === this.selectedSessionId()) {
            return;
          }
          const match = sessions.find((s) => s.id === targetSessionId);
          if (match) {
            this.selectSession(match);
          }
        },
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.chatUnread.setActiveSession(null);
  }

  selectSession(session: ChatSession): void {
    this.selectedSessionId.set(session.id);
    this.transcript.set([]);
    this.chatUnread.setActiveSession(session.id);

    if (!this.joinedSessions.has(session.id)) {
      this.joinedSessions.add(session.id);
      this.chat.joinSession(session.id).catch(() => this.joinedSessions.delete(session.id));
    }

    this.chat.getMessages(session.id).subscribe((history) => {
      this.transcript.set(history);
      this.scrollToBottom();
    });
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
      this.chatUnread.removeSession(session.id);
      if (this.selectedSessionId() === session.id) {
        this.selectedSessionId.set(null);
        this.transcript.set([]);
        this.chatUnread.setActiveSession(null);
      }
    });
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
