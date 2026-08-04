import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Inline/centred spinner for local loading states (lists, cards, dialogs). */
@Component({
  selector: 'app-spinner',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-8">
      <mat-progress-spinner mode="indeterminate" [diameter]="diameter()" color="primary" />
      @if (message()) {
        <p class="text-sm text-secondary">{{ message() }}</p>
      }
    </div>
  `,
})
export class SpinnerComponent {
  readonly diameter = input(40);
  readonly message = input('');
}
