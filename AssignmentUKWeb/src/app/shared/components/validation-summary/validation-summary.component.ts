import { Component, computed, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * Displays a consolidated list of validation errors for a FormGroup.
 * Only renders once the form is submitted/touched to avoid noise.
 */
@Component({
  selector: 'app-validation-summary',
  template: `
    @if (show() && messages().length) {
      <div class="mb-4 p-4 rounded-lg bg-error-container/60 border border-error/20" role="alert">
        <div class="flex items-center gap-2 text-on-error-container font-bold mb-2">
          <span class="material-symbols-outlined">error</span>
          Please fix the following:
        </div>
        <ul class="list-disc list-inside text-sm text-on-error-container/90 space-y-1">
          @for (msg of messages(); track msg) {
            <li>{{ msg }}</li>
          }
        </ul>
      </div>
    }
  `,
})
export class ValidationSummaryComponent {
  readonly form = input.required<FormGroup>();
  readonly show = input(true);
  /** Map of controlName → human label for nicer messages. */
  readonly labels = input<Record<string, string>>({});

  protected readonly messages = computed(() => {
    const form = this.form();
    const labels = this.labels();
    const result: string[] = [];
    Object.keys(form.controls).forEach((name) => {
      const control = form.get(name);
      if (!control || control.valid || !control.errors) {
        return;
      }
      const label = labels[name] ?? this.humanize(name);
      result.push(...this.describe(label, control.errors));
    });
    return result;
  });

  private describe(label: string, errors: Record<string, unknown>): string[] {
    return Object.keys(errors).map((key) => {
      switch (key) {
        case 'required':
          return `${label} is required.`;
        case 'email':
          return `${label} must be a valid email address.`;
        case 'minlength': {
          const e = errors[key] as { requiredLength: number };
          return `${label} must be at least ${e.requiredLength} characters.`;
        }
        case 'strongPassword':
          return `${label} must include upper & lower case, a number and a symbol.`;
        case 'mismatch':
          return `${label} does not match.`;
        case 'ukPhone':
          return `${label} must be a valid UK phone number.`;
        default:
          return `${label} is invalid.`;
      }
    });
  }

  private humanize(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  }
}
