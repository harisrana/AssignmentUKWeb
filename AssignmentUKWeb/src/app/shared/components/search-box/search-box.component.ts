import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

/** Debounced search input that emits the search term. */
@Component({
  selector: 'app-search-box',
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative w-full md:w-80">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary/50">search</span>
      <input
        [formControl]="control"
        [placeholder]="placeholder()"
        type="search"
        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
      />
    </div>
  `,
})
export class SearchBoxComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input('Search…');
  readonly search = output<string>();

  protected readonly control = new FormControl('', { nonNullable: true });

  constructor() {
    this.control.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.debounceMs),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.search.emit(value.trim()));
  }
}
