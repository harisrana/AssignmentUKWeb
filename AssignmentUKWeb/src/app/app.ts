import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GlobalLoaderComponent } from './shared/components/loader/global-loader.component';
import { BreadcrumbService } from './core/services/breadcrumb.service';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoaderComponent],
  template: `
    <app-global-loader />
    <router-outlet />
  `,
})
export class App implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  // Instantiate ThemeService eagerly so the saved theme applies on load.
  private readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    // Restore session from a stored token immediately (refreshing it first if
    // expired), so the header reflects the logged-in state on every route —
    // not just guarded /app/** routes, and not just while the access token
    // (15 min lifetime) happens to still be valid.
    this.auth.tryRestoreSession().subscribe((restored) => {
      if (restored) {
        // The JWT only carries id/roles/permissions — hydrate the full profile
        // (avatarUrl, bio, phone, ...) from the server in the background.
        this.auth.loadCurrentUser().subscribe({ error: () => undefined });
      }
    });

    this.translate.addLangs([...environment.supportedLanguages]);
    this.translate.setDefaultLang(environment.defaultLanguage);
    const browserLang = this.translate.getBrowserLang();
    const initial =
      browserLang && environment.supportedLanguages.includes(browserLang)
        ? browserLang
        : environment.defaultLanguage;
    this.translate.use(initial);

    this.breadcrumbs.init();
    // Touch the theme signal so the effect runs.
    this.theme.theme();
  }
}
