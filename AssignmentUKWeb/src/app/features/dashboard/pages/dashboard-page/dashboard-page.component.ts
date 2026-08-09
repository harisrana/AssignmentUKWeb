import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { DashboardStore } from '../../state/dashboard.store';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeaderComponent, StatCardComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  protected readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.store.load();
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'InProgress':
        return 'bg-blue-100 text-blue-700';
      case 'Review':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  statusLabel(status: string): string {
    return status === 'InProgress' ? 'In Progress' : status;
  }
}
