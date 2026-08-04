import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface ErrorData {
  code: string;
  heading: string;
  message: string;
  icon: string;
}

/** Shared, friendly error page for 403 / 404 / 500 (config via route data). */
@Component({
  selector: 'app-error-page',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-container-low px-6">
      <div class="text-center max-w-md">
        <div class="w-24 h-24 rounded-3xl orange-gradient mx-auto flex items-center justify-center mb-8 shadow-lg">
          <span class="material-symbols-outlined text-white text-5xl">{{ data().icon }}</span>
        </div>
        <p class="font-display-lg text-6xl font-extrabold text-brand-navy mb-2">{{ data().code }}</p>
        <h1 class="font-headline-md text-2xl font-bold text-brand-navy mb-3">{{ data().heading }}</h1>
        <p class="text-secondary mb-8">{{ data().message }}</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a routerLink="/app/dashboard" class="bg-brand-orange text-white px-6 py-3 rounded-lg font-bold soft-shadow-hover">
            Go to Dashboard
          </a>
          <a routerLink="/" class="border-2 border-brand-navy text-brand-navy px-6 py-3 rounded-lg font-bold hover:bg-brand-navy hover:text-white transition-all">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ErrorPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly data = toSignal(
    this.route.data.pipe(map((d) => d as unknown as ErrorData)),
    {
      initialValue: {
        code: '404',
        heading: 'Page Not Found',
        message: 'The page you are looking for could not be found.',
        icon: 'search_off',
      } as ErrorData,
    },
  );
}
