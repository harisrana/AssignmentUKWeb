import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SERVICES } from '../../core/constants/services.constant';

/**
 * Public marketing "master page": fixed top utility bar, sticky navbar (with a
 * Services dropdown) and footer that stay constant while the routed page
 * (Home / About / Services / Pricing) renders in the <router-outlet>.
 */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
  protected readonly services = SERVICES;
  protected readonly servicesOpen = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly year = new Date().getFullYear();

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
