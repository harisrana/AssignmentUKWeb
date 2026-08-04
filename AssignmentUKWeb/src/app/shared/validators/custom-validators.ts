import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Collection of reusable custom validators. */
export class CustomValidators {
  /** Requires at least one lowercase, uppercase, digit and symbol; min 8 chars. */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) {
        return null;
      }
      const valid =
        value.length >= 8 &&
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value) &&
        /[^A-Za-z0-9]/.test(value);
      return valid ? null : { strongPassword: true };
    };
  }

  /** Cross-field validator ensuring two controls match (e.g. password confirm). */
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const form = group as FormGroup;
      const control = form.get(controlName);
      const matching = form.get(matchingControlName);
      if (!control || !matching) {
        return null;
      }
      if (matching.errors && !matching.errors['mismatch']) {
        return null;
      }
      if (control.value !== matching.value) {
        matching.setErrors({ mismatch: true });
        return { mismatch: true };
      }
      matching.setErrors(null);
      return null;
    };
  }

  /** UK phone number (loose): +44 or 0 followed by 9–10 digits. */
  static ukPhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) {
        return null;
      }
      return /^(?:\+44|0)\d{9,10}$/.test(value.replace(/\s/g, '')) ? null : { ukPhone: true };
    };
  }

  /** No leading/trailing whitespace and not empty after trim. */
  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return value.trim().length === 0 ? { notBlank: true } : null;
    };
  }
}
