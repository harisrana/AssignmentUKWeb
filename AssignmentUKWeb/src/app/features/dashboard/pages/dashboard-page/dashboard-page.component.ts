import { Component, OnInit, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { DashboardStore } from '../../state/dashboard.store';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EnquiryStatusStore } from '../../../../core/services/enquiry-status.store';
import { EnquiryStatus, RecentEnquiry } from '../../models/dashboard.model';
import { StatusHistoryDialogComponent } from './status-history-dialog.component';
import { resolveAssetUrl } from '../../../../core/constants/api-endpoints';
import { contrastTextColor } from '../../../../core/utils/color.util';

const DEFAULT_STATUS_COLOR = '#6B7280';

export const ENQUIRY_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeaderComponent, StatCardComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  protected readonly auth = inject(AuthService);
  protected readonly statusStore = inject(EnquiryStatusStore);
  private readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(MatDialog);

  /** Statuses for the dropdown, in admin-defined display order. */
  protected readonly statuses = computed(() => this.statusStore.statuses().map((s) => s.name));

  protected readonly isAdmin = computed(() => this.auth.hasRole('Admin'));

  protected readonly pageSizeOptions = ENQUIRY_PAGE_SIZE_OPTIONS;

  protected readonly totalPages = computed(() => {
    const size = this.store.pageSize();
    return size <= 0 ? 0 : Math.ceil(this.store.totalCount() / size);
  });

  protected readonly rangeStart = computed(() =>
    this.store.totalCount() === 0 ? 0 : this.store.pageIndex() * this.store.pageSize() + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min((this.store.pageIndex() + 1) * this.store.pageSize(), this.store.totalCount()),
  );

  ngOnInit(): void {
    this.store.load();
    this.store.loadEnquiries(0, ENQUIRY_PAGE_SIZE_OPTIONS[0]);
    this.statusStore.load();
  }

  onPageSizeChange(pageSize: number): void {
    this.store.loadEnquiries(0, pageSize);
  }

  goToPreviousPage(): void {
    if (this.store.pageIndex() > 0) {
      this.store.loadEnquiries(this.store.pageIndex() - 1, this.store.pageSize());
    }
  }

  goToNextPage(): void {
    if (this.store.pageIndex() + 1 < this.totalPages()) {
      this.store.loadEnquiries(this.store.pageIndex() + 1, this.store.pageSize());
    }
  }

  statusColor(status: EnquiryStatus): string {
    return this.statusStore.lookup(status)?.colorHex ?? DEFAULT_STATUS_COLOR;
  }

  statusTextColor(status: EnquiryStatus): string {
    return contrastTextColor(this.statusColor(status));
  }

  /** Status names are admin-set free text now — no separate label lookup needed. */
  statusLabel(status: EnquiryStatus): string {
    return status;
  }

  attachmentUrl(enquiry: RecentEnquiry): string | null {
    return resolveAssetUrl(enquiry.attachmentUrl);
  }

  viewHistory(enquiry: RecentEnquiry): void {
    this.dashboardService.getEnquiryStatusHistory(enquiry.id).subscribe((history) => {
      this.dialog.open(StatusHistoryDialogComponent, {
        data: {
          studentName: enquiry.student,
          history,
          statusLabel: (s: string) => this.statusLabel(s),
          statusColor: (s: string) => this.statusColor(s),
          statusTextColor: (s: string) => this.statusTextColor(s),
        },
        width: '560px',
        autoFocus: false,
      });
    });
  }
}
