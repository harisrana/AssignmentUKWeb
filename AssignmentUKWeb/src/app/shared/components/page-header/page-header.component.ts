import { Component, input } from '@angular/core';

/** Consistent page title + subtitle + optional action slot for feature pages. */
@Component({
  selector: 'app-page-header',
  template: `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-headline-md text-2xl font-extrabold text-brand-navy">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-secondary mt-1">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex items-center gap-3">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
