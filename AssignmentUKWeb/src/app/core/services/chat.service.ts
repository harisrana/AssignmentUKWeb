import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { BaseApiService } from './base-api.service';
import { TokenService } from './token.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ChatMessage, ChatSession } from '../models/chat.model';

/**
 * Real-time support chat: REST for persistence, SignalR for live push.
 * Shared by the public visitor widget (anonymous) and the agent inbox
 * (JWT-authenticated) — the two differ only in how the hub connection
 * authenticates and which groups they join.
 */
@Injectable({ providedIn: 'root' })
export class ChatService extends BaseApiService {
  private readonly tokenService = inject(TokenService);

  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  /**
   * A connection can be a member of both a session group and the shared
   * "agents" group at once (an agent viewing an open conversation), so the
   * server's per-group broadcast can deliver the same message twice to one
   * connection. De-duped here so every consumer gets each message once.
   */
  private readonly seenMessageIds: string[] = [];
  private readonly seenMessageIdSet = new Set<string>();
  private static readonly MAX_SEEN_MESSAGE_IDS = 200;

  readonly messageReceived$ = new Subject<ChatMessage>();
  readonly sessionStarted$ = new Subject<ChatSession>();
  readonly sessionClosed$ = new Subject<string>();

  async connectAsVisitor(): Promise<void> {
    await this.ensureConnection(false);
  }

  async connectAsAgent(): Promise<void> {
    await this.ensureConnection(true);
    await this.connection?.invoke('JoinAgentGroup');
  }

  async joinSession(sessionId: string): Promise<void> {
    await this.connection?.invoke('JoinSession', sessionId);
  }

  createSession(visitorName?: string): Observable<ChatSession> {
    return this.post<ChatSession>(API_ENDPOINTS.chat.sessions, { visitorName });
  }

  updateVisitorName(sessionId: string, visitorName: string): Observable<void> {
    return this.patch<void>(API_ENDPOINTS.chat.visitorName(sessionId), { visitorName });
  }

  getMessages(sessionId: string): Observable<ChatMessage[]> {
    return this.get<ChatMessage[]>(API_ENDPOINTS.chat.messages(sessionId));
  }

  getOpenSessions(): Observable<ChatSession[]> {
    return this.get<ChatSession[]>(API_ENDPOINTS.chat.sessions);
  }

  sendVisitorMessage(sessionId: string, text: string): Observable<ChatMessage> {
    return this.post<ChatMessage>(API_ENDPOINTS.chat.messages(sessionId), { text });
  }

  sendAgentMessage(sessionId: string, text: string): Observable<ChatMessage> {
    return this.post<ChatMessage>(API_ENDPOINTS.chat.agentMessages(sessionId), { text });
  }

  closeSession(sessionId: string): Observable<void> {
    return this.post<void>(API_ENDPOINTS.chat.close(sessionId), {});
  }

  private async ensureConnection(asAgent: boolean): Promise<void> {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(API_ENDPOINTS.chat.hub, {
          withCredentials: false,
          ...(asAgent ? { accessTokenFactory: () => this.tokenService.getAccessToken() ?? '' } : {}),
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on('messageReceived', (message: ChatMessage) => {
        if (this.seenMessageIdSet.has(message.id)) {
          return;
        }
        this.seenMessageIdSet.add(message.id);
        this.seenMessageIds.push(message.id);
        if (this.seenMessageIds.length > ChatService.MAX_SEEN_MESSAGE_IDS) {
          const oldest = this.seenMessageIds.shift();
          if (oldest) {
            this.seenMessageIdSet.delete(oldest);
          }
        }
        this.messageReceived$.next(message);
      });
      this.connection.on('sessionStarted', (session: ChatSession) => this.sessionStarted$.next(session));
      this.connection.on('sessionClosed', (sessionId: string) => this.sessionClosed$.next(sessionId));
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      this.startPromise = this.connection.start();
    }

    if (this.startPromise) {
      await this.startPromise;
      this.startPromise = null;
    }
  }
}
