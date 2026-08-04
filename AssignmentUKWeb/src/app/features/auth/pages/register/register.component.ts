import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AuthActions } from '../../state/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth.selectors';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

/**
 * Registration page — mirrors the login split-screen layout.
 * Password rules match the API's RegisterCommandValidator so the user gets
 * immediate feedback instead of a round-trip rejection.
 */
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly loading = this.store.selectSignal(selectAuthLoading);
  protected readonly error = this.store.selectSignal(selectAuthError);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly benefits = [
    'Free account, no card required',
    'Track every assignment in one place',
    'Direct access to UK-based writers',
  ];

  protected readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100), CustomValidators.notBlank()]],
      lastName: ['', [Validators.required, Validators.maxLength(100), CustomValidators.notBlank()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, CustomValidators.strongPassword()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: CustomValidators.match('password', 'confirmPassword') },
  );

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  hasError(control: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, password } = this.form.getRawValue();
    this.store.dispatch(
      AuthActions.register({ request: { firstName, lastName, email, password } }),
    );
  }
}
