import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { LiveChatWidgetService } from '../../../../core/services/live-chat-widget.service';
import { ExpertWriter, Faq, Guarantee, Stat, WhyUsItem } from '../../models/landing.model';

/**
 * Public marketing landing page — reproduces the Stitch "home_desktop" design.
 */
@Component({
  selector: 'app-landing-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);
  private readonly liveChat = inject(LiveChatWidgetService);

  protected readonly quoteForm = this.fb.nonNullable.group({
    subject: ['', Validators.required],
    level: ['', Validators.required],
    deadline: ['', Validators.required],
    wordCount: [2500, [Validators.required, Validators.min(100)]],
  });

  protected readonly stats: Stat[] = [
    { icon: 'military_tech', value: '10+', label: 'Years Experience' },
    { icon: 'assignment_turned_in', value: '2M+', label: 'Orders Delivered' },
    { icon: 'groups', value: '50K+', label: 'Happy Students' },
  ];

  protected readonly writers: ExpertWriter[] = [
    {
      name: 'Dr. Sarah Thompson',
      credential: 'PhD in Law, Oxford',
      avatarUrl: 'https://i.pravatar.cc/160?img=47',
      tags: ['Legal Research', 'Case Analysis'],
      ordersDone: '1,240',
      successRate: '99.2%',
    },
    {
      name: 'Prof. James Wilson',
      credential: 'MBA, LSE Graduate',
      avatarUrl: 'https://i.pravatar.cc/160?img=12',
      tags: ['Business Strategy', 'Accounting'],
      ordersDone: '850+',
      successRate: '98.5%',
    },
    {
      name: 'Dr. Emily Carter',
      credential: 'PhD in Nursing, KCL',
      avatarUrl: 'https://i.pravatar.cc/160?img=45',
      tags: ['Medical Ethics', 'Nursing Care'],
      ordersDone: '2,100',
      successRate: '100%',
    },
  ];

  protected readonly whyUs: WhyUsItem[] = [
    { icon: 'school', title: 'Expert Writers', description: 'Qualified writers with advanced degrees.' },
    { icon: 'verified', title: 'Plagiarism Free', description: '100% original content with plagiarism report.' },
    { icon: 'schedule', title: 'On-Time Delivery', description: 'We value your time and always deliver on time.' },
    { icon: 'support_agent', title: '24/7 Support', description: 'Our support team is always here to help.' },
  ];

  protected readonly guarantees: Guarantee[] = [
    { icon: 'menu_book', title: 'Wide Range of Subjects', description: 'We cover all subjects and academic levels.' },
    { icon: 'shield', title: 'Secure & Confidential', description: 'Your data and privacy are always protected.' },
    { icon: 'thumb_up', title: '100% Satisfaction', description: 'We ensure quality work and student satisfaction.' },
    { icon: 'currency_pound', title: 'Money Back Guarantee', description: '100% money back if you are not satisfied.' },
  ];

  protected readonly faqs = signal<Faq[]>([
    {
      question: 'Is this content 100% original?',
      answer:
        'Yes, every assignment is written from scratch and checked with Turnitin to guarantee it is 100% plagiarism-free before delivery.',
      open: false,
    },
    {
      question: 'What are the payment options?',
      answer:
        'We accept all major credit/debit cards along with PayPal and Stripe, so you can pay securely in whichever way suits you.',
      open: false,
    },
    {
      question: 'Can you handle urgent deadlines?',
      answer:
        'Absolutely. We can deliver high-quality assignments in as little as 6 to 12 hours depending on the complexity and word count.',
      open: false,
    },
  ]);

  protected readonly subjects = ['Nursing', 'CIPD', 'Law', 'Business'];
  protected readonly levels = ['Undergraduate', "Master's", 'PhD'];

  openChat(): void {
    this.liveChat.openWidget();
  }

  toggleFaq(index: number): void {
    this.faqs.update((list) =>
      list.map((f, i) => (i === index ? { ...f, open: !f.open } : f)),
    );
  }

  getQuote(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      this.notify.warning('Please complete all fields to get a price.');
      return;
    }
    this.notify.success('Thanks! One of our experts will email your quote shortly.');
  }
}
