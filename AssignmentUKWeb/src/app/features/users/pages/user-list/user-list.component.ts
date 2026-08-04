import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PageChange, TableAction, TableColumn } from '../../../../shared/components/data-table/data-table.model';

import { UserActions } from '../../state/user.actions';
import {
  selectAllUsers,
  selectUsersLoading,
  selectUsersQuery,
  selectUsersTotalCount,
} from '../../state/user.selectors';
import { UserFormComponent } from '../user-form/user-form.component';
import { User } from '../../../../core/models/user.model';
import { PERMISSIONS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-user-list',
  imports: [
    PageHeaderComponent,
    SearchBoxComponent,
    DataTableComponent,
    HasPermissionDirective,
    MatButtonModule,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmDialogService);

  protected readonly permissions = PERMISSIONS;
  protected readonly users = this.store.selectSignal(selectAllUsers);
  protected readonly loading = this.store.selectSignal(selectUsersLoading);
  protected readonly totalCount = this.store.selectSignal(selectUsersTotalCount);
  protected readonly query = this.store.selectSignal(selectUsersQuery);

  protected readonly columns: TableColumn<User>[] = [
    { key: 'fullName', header: 'Name', cell: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles', type: 'chip', cell: (u) => u.roles.join(', ') },
    { key: 'isActive', header: 'Status', cell: (u) => (u.isActive ? 'Active' : 'Inactive') },
  ];

  protected readonly actions: TableAction<User>[] = [
    { icon: 'edit', label: 'Edit', color: 'primary' },
    { icon: 'delete', label: 'Delete', color: 'warn' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.store.dispatch(UserActions.loadUsers({ query: this.query() }));
  }

  onSearch(term: string): void {
    this.store.dispatch(UserActions.setQuery({ query: { search: term, pageIndex: 0 } }));
    this.reload();
  }

  onPageChange(change: PageChange): void {
    this.store.dispatch(UserActions.setQuery({ query: change }));
    this.reload();
  }

  openCreate(): void {
    this.dialog.open(UserFormComponent, { data: { user: null }, width: '560px', autoFocus: false });
  }

  onAction(event: { action: TableAction<User>; row: User }): void {
    if (event.action.label === 'Edit') {
      this.dialog.open(UserFormComponent, {
        data: { user: event.row },
        width: '560px',
        autoFocus: false,
      });
    } else if (event.action.label === 'Delete') {
      this.confirm
        .confirm({
          title: 'Delete user',
          message: `Are you sure you want to delete ${event.row.firstName} ${event.row.lastName}? This cannot be undone.`,
          variant: 'danger',
          confirmText: 'Delete',
        })
        .subscribe((ok) => {
          if (ok) {
            this.store.dispatch(UserActions.deleteUser({ id: event.row.id }));
          }
        });
    }
  }
}
