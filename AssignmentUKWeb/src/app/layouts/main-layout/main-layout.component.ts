import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MenuService } from '../../core/services/menu.service';
import { ThemeService } from '../../core/services/theme.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { SessionTimeoutService } from '../../core/services/session-timeout.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatUnreadService } from '../../core/services/chat-unread.service';
import { ChatSession } from '../../core/models/chat.model';
import { AuthActions } from '../../features/auth/state/auth.actions';
import { environment } from '../../../environments/environment';
import { resolveAssetUrl } from '../../core/constants/api-endpoints';
import { PERMISSIONS } from '../../core/constants/app.constants';

/**
 * Authenticated application shell: responsive sidenav with a dynamic,
 * permission-aware menu; top toolbar with breadcrumbs, theme + language
 * switchers, notification center and user menu. Boots idle-session detection.
 */
@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatMenuModule,
    MatDividerModule,
    TranslateModule,
    UpperCasePipe,
    DatePipe,
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);
  private readonly session = inject(SessionTimeoutService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly menuService = inject(MenuService);
  protected readonly theme = inject(ThemeService);
  protected readonly breadcrumbs = inject(BreadcrumbService);
  protected readonly auth = inject(AuthService);
  protected readonly chatUnread = inject(ChatUnreadService);

  /** Matches the Tailwind `lg` breakpoint used elsewhere in this layout (e.g. chat inbox grid). */
  protected readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 1023px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly sidenavMode = computed<'over' | 'side'>(() => (this.isHandset() ? 'over' : 'side'));

  protected readonly sidenavOpen = signal(true);
  protected readonly expanded = signal<Record<string, boolean>>({});
  protected readonly languages = environment.supportedLanguages;
  protected readonly currentLang = signal(this.translate.currentLang ?? environment.defaultLanguage);
  protected readonly avatarUrl = computed(() => resolveAssetUrl(this.auth.user()?.avatarUrl));

  constructor() {
    // Collapsed by default on mobile/tablet (overlay mode) so it doesn't cover the page;
    // expanded by default on desktop (push mode). Re-evaluated only when the breakpoint
    // itself changes, so a manual toggle within the same breakpoint isn't overridden.
    effect(() => this.sidenavOpen.set(!this.isHandset()));
  }

  ngOnInit(): void {
    this.session.start();
    // The chat inbox endpoints are agent-only server-side (AdminOnly policy) — initializing
    // this for every authenticated user 403s in the background for anyone without chat.manage,
    // and the global HTTP error interceptor treats any 403 as a hard redirect to /error/403,
    // which was blocking non-admin users out of the entire /app shell (Profile, Settings, ...).
    if (this.auth.hasPermission(PERMISSIONS.chatManage)) {
      void this.chatUnread.init();
    }
  }

  openChatSession(session: ChatSession): void {
    void this.router.navigate(['/app/chat'], { queryParams: { sessionId: session.id } });
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  closeSidenavOnHandset(): void {
    if (this.isHandset()) {
      this.sidenavOpen.set(false);
    }
  }

  toggleGroup(label: string): void {
    this.expanded.update((state) => ({ ...state, [label]: !state[label] }));
  }

  isExpanded(label: string): boolean {
    return this.expanded()[label] ?? false;
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
