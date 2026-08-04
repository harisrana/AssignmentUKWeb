import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AuthActions } from '../../state/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth.selectors';

/**
 * Login page — reproduces the Stitch "login_desktop" split-screen design.
 * Uses Reactive Forms and dispatches to the NgRx auth store.
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = this.store.selectSignal(selectAuthLoading);
  protected readonly error = this.store.selectSignal(selectAuthError);
  protected readonly showPassword = signal(false);
  protected readonly infoMessage = signal<string | null>(null);

  protected readonly highlights = [
    'UK-Based Professional Writers',
    '24/7 Academic Support',
    '100% Confidential Service',
  ];

  private returnUrl = '/app/dashboard';

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app/dashboard';
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session-expired' || reason === 'timeout') {
      this.infoMessage.set('Your session has ended. Please log in again.');
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  hasError(control: 'email' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, rememberMe } = this.form.getRawValue();
    this.store.dispatch(
      AuthActions.login({ request: { email, password, rememberMe }, returnUrl: this.returnUrl }),
    );
  }
}
