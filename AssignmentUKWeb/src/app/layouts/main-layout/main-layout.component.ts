import { Component, OnInit, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MenuService } from '../../core/services/menu.service';
import { ThemeService } from '../../core/services/theme.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { SessionTimeoutService } from '../../core/services/session-timeout.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from '../../features/auth/state/auth.actions';
import { environment } from '../../../environments/environment';

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
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);
  private readonly session = inject(SessionTimeoutService);

  protected readonly menuService = inject(MenuService);
  protected readonly theme = inject(ThemeService);
  protected readonly breadcrumbs = inject(BreadcrumbService);
  protected readonly auth = inject(AuthService);

  protected readonly sidenavOpen = signal(true);
  protected readonly expanded = signal<Record<string, boolean>>({});
  protected readonly languages = environment.supportedLanguages;
  protected readonly currentLang = signal(this.translate.currentLang ?? environment.defaultLanguage);

  ngOnInit(): void {
    this.session.start();
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
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
