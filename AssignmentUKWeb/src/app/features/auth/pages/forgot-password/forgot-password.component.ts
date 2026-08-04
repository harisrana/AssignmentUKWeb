import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="w-full max-w-md mx-auto my-stack-lg px-margin-mobile">
      <div class="bg-surface-container-lowest rounded-xl soft-shadow p-8 md:p-12">
        <h1 class="font-headline-md text-headline-md text-brand-navy mb-2">Reset Password</h1>
        <p class="text-secondary mb-6">Enter your email and we'll send you a reset link.</p>

        @if (sent()) {
          <div class="p-4 rounded-lg bg-primary/10 text-on-primary-container">
            If an account exists for that email, a reset link is on its way.
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div class="space-y-2">
              <label class="font-label-md text-label-md text-brand-navy" for="email">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                class="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full bg-brand-orange text-white py-3 rounded-lg font-bold soft-shadow-hover disabled:opacity-60"
            >
              {{ loading() ? 'Sending…' : 'Send Reset Link' }}
            </button>
          </form>
        }

        <a routerLink="/auth/login" class="block mt-6 text-center text-primary font-bold hover:underline">
          ← Back to login
        </a>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly notify = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.http
      .post(API_ENDPOINTS.auth.forgotPassword, this.form.getRawValue())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.sent.set(true);
        },
        error: () => {
          // Still show success to avoid account enumeration.
          this.loading.set(false);
          this.sent.set(true);
        },
      });
  }
}
