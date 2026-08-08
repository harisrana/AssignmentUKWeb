import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SERVICES } from '../../core/constants/services.constant';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from '../../features/auth/state/auth.actions';
import { resolveAssetUrl } from '../../core/constants/api-endpoints';
import { LiveChatComponent } from '../../shared/components/live-chat/live-chat.component';

/**
 * Public marketing "master page": fixed top utility bar, sticky navbar (with a
 * Services dropdown) and footer that stay constant while the routed page
 * (Home / About / Services / Pricing) renders in the <router-outlet>.
 */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatMenuModule, MatDividerModule, LiveChatComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
  private readonly store = inject(Store);

  protected readonly auth = inject(AuthService);
  protected readonly services = SERVICES;
  protected readonly servicesOpen = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly year = new Date().getFullYear();
  protected readonly avatarUrl = computed(() => resolveAssetUrl(this.auth.user()?.avatarUrl));

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.closeMenus();
  }

  toggleServices(): void {
    this.servicesOpen.update((v) => !v);
  }

  closeMenus(): void {
    this.servicesOpen.set(false);
    this.mobileOpen.set(false);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  /** Close the dropdown when clicking outside the navbar. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-services-menu]')) {
      this.servicesOpen.set(false);
    }
  }
}
