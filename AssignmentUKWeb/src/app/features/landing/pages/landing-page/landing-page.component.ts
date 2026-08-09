import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { LiveChatWidgetService } from '../../../../core/services/live-chat-widget.service';
import { ExpertWriter, Faq, Guarantee, ProcessStep } from '../../models/landing.model';

/**
 * Public marketing landing page — reproduces the Stitch "home_desktop" design.
 */
@Component({
  selector: 'app-landing-page',
  imports: [ReactiveFormsModule],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);
  private readonly liveChat = inject(LiveChatWidgetService);

  protected readonly quoteForm = this.fb.nonNullable.group({
    subject: ['Nursing', Validators.required],
    level: ['Undergraduate', Validators.required],
    deadline: ['', Validators.required],
    wordCount: [2500, [Validators.required, Validators.min(100)]],
  });

  protected readonly stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '2M+', label: 'Orders Delivered' },
    { value: '999+', label: 'Expert Writers' },
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

  protected readonly steps: ProcessStep[] = [
    { icon: 'description', title: 'Share Brief', description: 'Upload your instructions and requirements.', accent: true },
    { icon: 'track_changes', title: 'Track Progress', description: 'Monitor your assignment in real-time.', accent: false },
    { icon: 'task_alt', title: 'Receive Draft', description: 'Download your custom-written paper.', accent: false },
    { icon: 'send', title: 'Submit & Win', description: 'Hand in your work with total confidence.', accent: true },
  ];

  protected readonly guarantees: Guarantee[] = [
    { icon: 'history', title: 'Unlimited Revisions', description: "We aren't happy until you are. Free changes included." },
    { icon: 'spellcheck', title: 'Turnitin Report', description: '100% original work with official evidence.' },
    { icon: 'thumb_up', title: '100% Satisfaction', description: 'Consistently achieving top grades for students.' },
    { icon: 'savings', title: 'Cheapest Rates', description: 'Premium quality at student-friendly prices.' },
  ];

  protected readonly faqs = signal<Faq[]>([
    {
      question: 'Is this service confidential?',
      answer:
        'Yes, your privacy is our top priority. We use end-to-end encryption and never share your details with any third parties or your university.',
      open: false,
    },
    {
      question: 'Who will write my assignment?',
      answer:
        "Your assignment will be handled by a UK-based writer with at least a Master's or PhD degree in your specific subject area.",
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
