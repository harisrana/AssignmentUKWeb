import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GlobalLoaderComponent } from './shared/components/loader/global-loader.component';
import { BreadcrumbService } from './core/services/breadcrumb.service';
import { ThemeService } from './core/services/theme.service';
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

  ngOnInit(): void {
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
