export type ChatSenderType = 'Visitor' | 'Agent';

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  senderType: ChatSenderType;
  senderName?: string | null;
  text: string;
  createdDate: string;
}

export interface ChatSession {
  id: string;
  status: 'Open' | 'Closed';
  visitorName?: string | null;
  lastMessageAt: string;
  createdDate: string;
  messages: ChatMessage[];
}
