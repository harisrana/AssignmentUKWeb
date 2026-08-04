import { Component, computed, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SpinnerComponent } from '../loader/spinner.component';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { PageChange, TableAction, TableColumn } from './data-table.model';

/**
 * Reusable, server-paginated data table built on MatTable + MatPaginator.
 * Generic over the row type; columns and row-actions are configured by inputs.
 */
@Component({
  selector: 'app-data-table',
  imports: [MatTableModule, MatPaginatorModule, SpinnerComponent],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly totalCount = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input<number>(APP_CONSTANTS.defaultPageSize);
  readonly loading = input(false);
  readonly actions = input<TableAction<T>[]>([]);
  readonly emptyMessage = input('No records found.');

  readonly pageChange = output<PageChange>();
  readonly actionClick = output<{ action: TableAction<T>; row: T }>();

  protected readonly pageSizeOptions = APP_CONSTANTS.pageSizeOptions;

  protected readonly displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.key);
    return this.actions().length ? [...cols, '__actions__'] : cols;
  });

  cellValue(col: TableColumn<T>, row: T): string {
    if (col.cell) {
      return col.cell(row);
    }
    const value = (row as Record<string, unknown>)[col.key];
    return value === null || value === undefined ? '' : String(value);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  onAction(action: TableAction<T>, row: T): void {
    this.actionClick.emit({ action, row });
  }
}
