import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Faq } from '../../../landing/models/landing.model';

interface ServicePricing {
  label: string;
  features: string[];
  fromPrice: number;
}

@Component({
  selector: 'app-pricing',
  imports: [RouterLink],
  templateUrl: './pricing.component.html',
})
export class PricingComponent {
  protected readonly servicePricing: ServicePricing[] = [
    {
      label: 'Writing',
      features: ['Original content from scratch', 'In-depth research & referencing', 'Structured to your brief', 'Free plagiarism report', 'Unlimited free revisions'],
      fromPrice: 12.99,
    },
    {
      label: 'Editing',
      features: ['Enhancing language accuracy', 'Improving overall readability', 'Editing sentence structure', 'Ensuring relevance of content', 'Refining sentence organization'],
      fromPrice: 4.99,
    },
    {
      label: 'Proofreading',
      features: ['Grammar & spelling correction', 'Punctuation & formatting checks', 'Consistency review', 'Referencing/citation checks', 'Fast turnaround'],
      fromPrice: 2.99,
    },
  ];

  protected readonly activeServiceIndex = signal(1);

  protected readonly faqs = signal<Faq[]>([
    { question: 'Are there any hidden charges?', answer: 'No. The price you see is the price you pay — no hidden fees, ever.', open: false },
    { question: 'Do you offer discounts?', answer: 'Yes, we offer loyalty discounts and seasonal offers for returning students.', open: false },
    { question: 'What is your refund policy?', answer: 'If we miss the agreed quality or deadline, you are covered by our money-back guarantee.', open: false },
  ]);

  toggleFaq(index: number): void {
    this.faqs.update((list) => list.map((f, i) => (i === index ? { ...f, open: !f.open } : f)));
  }
}
