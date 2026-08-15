import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PricingRuleService } from '../../../../core/services/pricing-rule.service';
import { PricingRule } from '../../../../core/models/pricing-rule.model';

const PACKAGE_OPTIONS = ['Standard', 'Premium', 'Platinum'];
const ACADEMIC_LEVEL_OPTIONS = ['Undergraduate', "Master's", 'PhD'];

interface NewRuleForm {
  name: string;
  packageName: string;
  academicLevel: string;
  minPages: number | null;
  discountPercentage: number;
}

const EMPTY_FORM: NewRuleForm = {
  name: '',
  packageName: '',
  academicLevel: '',
  minPages: null,
  discountPercentage: 0,
};

/** Admin-only pricing/discount rule management — Configuration → Add Rule. */
@Component({
  selector: 'app-pricing-rules-page',
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Add Rule" subtitle="Manage discount rules applied to order pricing." />

    <div class="max-w-4xl space-y-6">
      <!-- Existing rules -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Pricing Rules</h3>

        <div class="space-y-2">
          @for (rule of rules(); track rule.id) {
            <div class="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 flex-wrap" [class.opacity-50]="!rule.isActive">
              <div class="flex-1 min-w-[160px]">
                <p class="font-semibold text-brand-navy">{{ rule.name }}</p>
                <p class="text-xs text-secondary">
                  {{ rule.packageName ?? 'Any package' }} · {{ rule.academicLevel ?? 'Any level' }}
                  @if (rule.minPages) { · Min {{ rule.minPages }} pages }
                </p>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold shrink-0">
                {{ rule.discountPercentage }}% off
              </span>
              <span class="text-xs text-secondary shrink-0">{{ rule.isActive ? 'Active' : 'Inactive' }}</span>
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-brand-navy hover:bg-surface-container shrink-0"
                (click)="toggleActive(rule)"
                [title]="rule.isActive ? 'Deactivate' : 'Activate'"
              >
                <span class="material-symbols-outlined text-lg">{{ rule.isActive ? 'toggle_on' : 'toggle_off' }}</span>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10 shrink-0"
                (click)="remove(rule)"
                title="Delete"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          } @empty {
            <p class="text-sm text-secondary py-4 text-center">No pricing rules yet — add one below.</p>
          }
        </div>
      </section>

      <!-- Add new rule -->
      <section class="bg-surface-container-lowest rounded-2xl shadow-custom p-6">
        <h3 class="font-bold text-brand-navy mb-4">Add Rule</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-secondary">Rule name</label>
            <input
              type="text"
              [(ngModel)]="form.name"
              placeholder="e.g. Platinum bulk discount"
              class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-brand-orange rounded-lg px-3 py-2.5 text-sm text-brand-navy outline-none"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-secondary">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              [(ngModel)]="form.discountPercentage"
              class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-brand-orange rounded-lg px-3 py-2.5 text-sm text-brand-navy outline-none"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-secondary">Package (optional)</label>
            <select
              [(ngModel)]="form.packageName"
              class="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm text-brand-navy outline-none"
            >
              <option value="">Any package</option>
              @for (pkg of packageOptions; track pkg) {
                <option [value]="pkg">{{ pkg }}</option>
              }
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-secondary">Academic level (optional)</label>
            <select
              [(ngModel)]="form.academicLevel"
              class="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm text-brand-navy outline-none"
            >
              <option value="">Any level</option>
              @for (level of academicLevelOptions; track level) {
                <option [value]="level">{{ level }}</option>
              }
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-secondary">Minimum pages (optional)</label>
            <input
              type="number"
              min="0"
              [(ngModel)]="form.minPages"
              placeholder="No minimum"
              class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-brand-orange rounded-lg px-3 py-2.5 text-sm text-brand-navy outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          (click)="add()"
          [disabled]="!form.name.trim()"
          class="mt-4 px-5 py-2.5 rounded-lg bg-brand-orange text-white text-sm font-bold disabled:opacity-50"
        >
          Add Rule
        </button>
      </section>
    </div>
  `,
})
export class PricingRulesPageComponent implements OnInit {
  private readonly service = inject(PricingRuleService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notify = inject(NotificationService);

  protected readonly rules = signal<PricingRule[]>([]);
  protected readonly packageOptions = PACKAGE_OPTIONS;
  protected readonly academicLevelOptions = ACADEMIC_LEVEL_OPTIONS;
  protected form: NewRuleForm = { ...EMPTY_FORM };

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.service.list(true).subscribe((rules) => this.rules.set(rules));
  }

  add(): void {
    const name = this.form.name.trim();
    if (!name) {
      return;
    }

    this.service
      .create({
        name,
        packageName: this.form.packageName || null,
        academicLevel: this.form.academicLevel || null,
        minPages: this.form.minPages,
        discountPercentage: this.form.discountPercentage,
      })
      .subscribe({
        next: () => {
          this.form = { ...EMPTY_FORM };
          this.load();
          this.notify.success('Rule added.');
        },
        error: (err) => this.notify.error(err?.error?.message ?? 'Could not add the rule.'),
      });
  }

  toggleActive(rule: PricingRule): void {
    this.service
      .update(rule.id, {
        name: rule.name,
        packageName: rule.packageName,
        academicLevel: rule.academicLevel,
        minPages: rule.minPages,
        discountPercentage: rule.discountPercentage,
        isActive: !rule.isActive,
      })
      .subscribe({
        next: () => this.load(),
        error: () => this.notify.error('Could not update the rule.'),
      });
  }

  remove(rule: PricingRule): void {
    this.confirmDialog
      .confirm({
        title: 'Delete rule?',
        message: `Delete "${rule.name}"? This can't be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.remove(rule.id).subscribe({
          next: () => this.load(),
          error: () => this.notify.error('Could not delete the rule.'),
        });
      });
  }
}
