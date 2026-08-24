import { Component, OnInit, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DashboardStore } from '../../../dashboard/state/dashboard.store';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { EnquiryStatusStore } from '../../../../core/services/enquiry-status.store';
import { EnquiryStatus, RecentEnquiry } from '../../../dashboard/models/dashboard.model';
import { StatusHistoryDialogComponent } from '../../../dashboard/pages/dashboard-page/status-history-dialog.component';
import { resolveAssetUrl } from '../../../../core/constants/api-endpoints';
import { contrastTextColor } from '../../../../core/utils/color.util';

const DEFAULT_STATUS_COLOR = '#6B7280';

export const ORDERS_REPORT_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

/** Reports → All Orders: the full paginated list of every order/enquiry (not just the dashboard's recent slice). */
@Component({
  selector: 'app-orders-report-page',
  imports: [PageHeaderComponent, DatePipe, CurrencyPipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './orders-report-page.component.html',
})
export class OrdersReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(DashboardStore);
  protected readonly statusStore = inject(EnquiryStatusStore);
  private readonly dashboardService = inject(DashboardService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  protected readonly statuses = computed(() => this.statusStore.statuses().map((s) => s.name));

  protected readonly pageSizeOptions = ORDERS_REPORT_PAGE_SIZE_OPTIONS;

  protected readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    fromDate: [''],
    toDate: [''],
  });

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
    this.store.loadEnquiries(0, ORDERS_REPORT_PAGE_SIZE_OPTIONS[0]);
    this.statusStore.load();
  }

  applyFilters(): void {
    const { status, fromDate, toDate } = this.filterForm.getRawValue();
    this.store.setFilters({
      status: status || null,
      fromDate: fromDate || null,
      toDate: toDate || null,
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ status: '', fromDate: '', toDate: '' });
    this.store.setFilters({ status: null, fromDate: null, toDate: null });
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

  statusLabel(status: EnquiryStatus): string {
    return status;
  }

  attachmentUrl(enquiry: RecentEnquiry): string | null {
    return resolveAssetUrl(enquiry.attachmentUrl);
  }

  onStatusChange(enquiry: RecentEnquiry, status: string, selectEl: HTMLSelectElement): void {
    const newStatus = status as EnquiryStatus;
    if (newStatus === enquiry.status) {
      return;
    }

    this.confirmDialog
      .confirm({
        title: 'Change status?',
        message: `Change "${enquiry.student}"'s enquiry status from ${this.statusLabel(enquiry.status)} to ${this.statusLabel(newStatus)}?`,
        confirmText: 'Change status',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.updateEnquiryStatus(enquiry.id, newStatus);
        } else {
          selectEl.value = enquiry.status;
        }
      });
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
