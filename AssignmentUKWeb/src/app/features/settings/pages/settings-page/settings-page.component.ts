import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EnquiryStatusSettingsComponent } from '../../components/enquiry-status-settings/enquiry-status-settings.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-settings-page',
  imports: [PageHeaderComponent, MatSlideToggleModule, UpperCasePipe, EnquiryStatusSettingsComponent],
  template: `
    <app-page-header title="Settings" subtitle="Manage your workspace preferences." />

    <div class="max-w-2xl space-y-6">
      <!-- Appearance -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Appearance</h3>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-brand-navy">Dark mode</p>
            <p class="text-sm text-secondary">Switch between light and dark themes.</p>
          </div>
          <mat-slide-toggle [checked]="theme.theme() === 'dark'" (change)="theme.toggle()" />
        </div>
      </section>

      <!-- Language -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Language</h3>
        <div class="flex flex-wrap gap-2">
          @for (lang of languages; track lang) {
            <button
              type="button"
              (click)="setLanguage(lang)"
              class="px-4 py-2 rounded-lg font-bold text-sm border transition-all"
              [class.bg-brand-orange]="current === lang"
              [class.text-white]="current === lang"
              [class.border-brand-orange]="current === lang"
              [class.border-outline-variant]="current !== lang"
              [class.text-secondary]="current !== lang"
            >
              {{ lang | uppercase }}
            </button>
          }
        </div>
      </section>

      <!-- Notifications -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Notifications</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-brand-navy">Email notifications</span>
            <mat-slide-toggle checked />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-brand-navy">Order status alerts</span>
            <mat-slide-toggle checked />
          </div>
        </div>
      </section>

      @if (auth.hasRole('Admin')) {
        <app-enquiry-status-settings />
      }
    </div>
  `,
})
export class SettingsPageComponent {
  private readonly translate = inject(TranslateService);
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);

  protected readonly languages = environment.supportedLanguages;
  protected current = this.translate.currentLang ?? environment.defaultLanguage;

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.current = lang;
  }
}
