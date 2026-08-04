import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

/**
 * Layout for unauthenticated pages (login, forgot password).
 * Provides the branded top bar + footer; the page fills the middle.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-surface-container-low">
      <header class="bg-surface shadow-md sticky top-0 z-50">
        <div
          class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-20"
        >
          <a routerLink="/" class="font-headline-md text-headline-md font-extrabold text-brand-navy">
            Assignment <span class="text-brand-orange">Writings UK</span>
          </a>
          <a
            routerLink="/"
            class="font-label-md text-label-md text-secondary hover:text-primary transition-colors"
          >
            ← Back to site
          </a>
        </div>
      </header>

      <main class="flex-1 flex items-center justify-center">
        <router-outlet />
      </main>

      <footer class="bg-inverse-surface text-white/60 text-center py-6 text-sm">
        © {{ year }} Assignment Writings UK. All Rights Reserved.
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {
  protected readonly year = new Date().getFullYear();
}
