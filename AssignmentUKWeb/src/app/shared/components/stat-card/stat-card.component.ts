import { Component, input } from '@angular/core';

/** KPI / statistic card used on the dashboard. */
@Component({
  selector: 'app-stat-card',
  template: `
    <div class="bg-surface-container-lowest rounded-2xl shadow-custom border border-outline-variant/10 p-6">
      <div class="flex items-center justify-between mb-4">
        <span
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          [class]="iconBgClass()"
        >
          <span class="material-symbols-outlined text-white text-2xl">{{ icon() }}</span>
        </span>
        @if (trend()) {
          <span
            class="text-xs font-bold flex items-center gap-0.5"
            [class.text-green-600]="!negative()"
            [class.text-error]="negative()"
          >
            <span class="material-symbols-outlined text-sm">{{ negative() ? 'trending_down' : 'trending_up' }}</span>
            {{ trend() }}
          </span>
        }
      </div>
      <p class="text-3xl font-extrabold text-brand-navy">{{ value() }}</p>
      <p class="text-sm text-secondary mt-1">{{ label() }}</p>
    </div>
  `,
})
export class StatCardComponent {
  readonly icon = input('insights');
  readonly value = input.required<string | number | null>();
  readonly label = input.required<string>();
  readonly trend = input('');
  readonly negative = input(false);
  readonly iconBgClass = input('bg-brand-orange');
}
