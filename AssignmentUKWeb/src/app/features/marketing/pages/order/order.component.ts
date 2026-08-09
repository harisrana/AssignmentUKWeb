import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PriceEstimateService } from '../../../../core/services/price-estimate.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface PricingTier {
  name: string;
  pricePer500Words: number;
  featured: boolean;
  features: string[];
}

@Component({
  selector: 'app-order',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './order.component.html',
})
export class OrderComponent {
  private readonly fb = inject(FormBuilder);
  private readonly priceEstimateService = inject(PriceEstimateService);
  private readonly notify = inject(NotificationService);

  protected readonly tiers: PricingTier[] = [
    {
      name: 'Standard',
      pricePer500Words: 12,
      featured: false,
      features: ['2:2 standard writer', '7-day delivery', 'Free Turnitin report', 'Unlimited revisions'],
    },
    {
      name: 'Premium',
      pricePer500Words: 18,
      featured: true,
      features: ['2:1 expert writer', '3-day delivery', 'Free Turnitin report', 'Priority support', 'Plagiarism guarantee'],
    },
    {
      name: 'Platinum',
      pricePer500Words: 26,
      featured: false,
      features: ['First-class PhD writer', '24-hour delivery', 'Free Turnitin report', 'Dedicated manager', 'Top-grade guarantee'],
    },
  ];

  protected readonly levels = [
    { label: 'Undergraduate', multiplier: 1 },
    { label: "Master's", multiplier: 1.3 },
    { label: 'PhD', multiplier: 1.6 },
  ];

  protected readonly countries = [
    'United Kingdom', 'United States', 'Canada', 'Australia', 'Ireland',
    'New Zealand', 'Pakistan', 'India', 'United Arab Emirates', 'Other',
  ];

  protected readonly form = this.fb.nonNullable.group({
    pages: [5],
    level: [1],
    tier: [18],
  });

  protected readonly orderForm = this.fb.nonNullable.group({
    details: [''],
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(30)]],
    country: ['', [Validators.required]],
  });

  protected readonly submitting = signal(false);

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly selectedPricePer500Words = computed(() => Number(this.value().tier));

  /** Pricing is per 500-word block — `pages` holds the block count. */
  protected readonly wordCount = computed(() => (Number(this.value().pages) || 0) * 500);

  protected readonly estimate = computed(() => {
    const v = this.value();
    const pages = Number(v.pages) || 0;
    const level = Number(v.level) || 1;
    const pricePer500Words = Number(v.tier) || 0;
    return Math.round(pages * pricePer500Words * level);
  });

  blockNonDigit(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  stripNonDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');
    if (digitsOnly !== input.value) {
      this.orderForm.controls.mobileNo.setValue(digitsOnly);
    }
  }

  choosePackage(tier: PricingTier): void {
    this.form.controls.tier.setValue(tier.pricePer500Words);
    document.getElementById('estimate-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  submitOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const v = this.value();
    const pages = Number(v.pages) || 0;
    const pricePer500Words = Number(v.tier) || 0;
    const tier = this.tiers.find((t) => t.pricePer500Words === pricePer500Words);
    const level = this.levels.find((l) => l.multiplier === Number(v.level));
    const order = this.orderForm.getRawValue();

    this.submitting.set(true);
    this.priceEstimateService
      .submit({
        details: order.details,
        fullName: order.fullName,
        email: order.email,
        mobileNo: order.mobileNo,
        country: order.country,
        pages,
        academicLevel: level?.label ?? 'Undergraduate',
        packageName: tier?.name ?? 'Standard',
        pricePerPage: pricePer500Words,
        estimatedTotal: this.estimate(),
        currency: 'GBP',
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.notify.success('Your order request has been submitted. We will contact you shortly.');
          this.orderForm.reset();
        },
        error: () => {
          this.submitting.set(false);
          this.notify.error('Something went wrong. Please try again.');
        },
      });
  }
}
