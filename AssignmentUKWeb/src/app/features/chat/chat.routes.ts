import { Routes } from '@angular/router';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    title: 'Live Chat • Assignment Writings UK',
    loadComponent: () =>
      import('./pages/chat-inbox/chat-inbox.component').then((m) => m.ChatInboxComponent),
  },
];
