import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Faq } from '../../../landing/models/landing.model';

interface PricingTier {
  name: string;
  perPage: number;
  featured: boolean;
  features: string[];
}

@Component({
  selector: 'app-pricing',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './pricing.component.html',
})
export class PricingComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly tiers: PricingTier[] = [
    {
      name: 'Standard',
      perPage: 12,
      featured: false,
      features: ['2:2 standard writer', '7-day delivery', 'Free Turnitin report', 'Unlimited revisions'],
    },
    {
      name: 'Premium',
      perPage: 18,
      featured: true,
      features: ['2:1 expert writer', '3-day delivery', 'Free Turnitin report', 'Priority support', 'Plagiarism guarantee'],
    },
    {
      name: 'Platinum',
      perPage: 26,
      featured: false,
      features: ['First-class PhD writer', '24-hour delivery', 'Free Turnitin report', 'Dedicated manager', 'Top-grade guarantee'],
    },
  ];

  protected readonly levels = [
    { label: 'Undergraduate', multiplier: 1 },
    { label: "Master's", multiplier: 1.3 },
    { label: 'PhD', multiplier: 1.6 },
  ];

  protected readonly form = this.fb.nonNullable.group({
    pages: [5],
    level: [1],
    tier: [18],
  });

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly estimate = computed(() => {
    const v = this.value();
    const pages = Number(v.pages) || 0;
    const level = Number(v.level) || 1;
    const perPage = Number(v.tier) || 0;
    return Math.round(pages * perPage * level);
  });

  protected readonly faqs = signal<Faq[]>([
    { question: 'Are there any hidden charges?', answer: 'No. The price you see is the price you pay — no hidden fees, ever.', open: false },
    { question: 'Do you offer discounts?', answer: 'Yes, we offer loyalty discounts and seasonal offers for returning students.', open: false },
    { question: 'What is your refund policy?', answer: 'If we miss the agreed quality or deadline, you are covered by our money-back guarantee.', open: false },
  ]);

  toggleFaq(index: number): void {
    this.faqs.update((list) => list.map((f, i) => (i === index ? { ...f, open: !f.open } : f)));
  }
}
