import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * App-wide top progress bar shown while any HTTP request is in flight.
 * Bound to LoadingService (fed by the loading interceptor).
 */
@Component({
  selector: 'app-global-loader',
  imports: [MatProgressBarModule],
  template: `
    @if (loading.isLoading()) {
      <mat-progress-bar
        class="!fixed top-0 left-0 right-0 z-[9999]"
        mode="indeterminate"
        color="primary"
      />
    }
  `,
})
export class GlobalLoaderComponent {
  protected readonly loading = inject(LoadingService);
}
