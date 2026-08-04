import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { UserActions } from '../../state/user.actions';
import { User } from '../../../../core/models/user.model';
import { ROLES } from '../../../../core/constants/app.constants';
import { CustomValidators } from '../../../../shared/validators/custom-validators';
import { ValidationSummaryComponent } from '../../../../shared/components/validation-summary/validation-summary.component';

export interface UserFormData {
  user: User | null;
}

/**
 * Create/Edit user dialog. Reactive form with custom validators; dispatches the
 * appropriate NgRx action on submit.
 */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, ValidationSummaryComponent],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly ref = inject(MatDialogRef<UserFormComponent>);
  protected readonly data = inject<UserFormData>(MAT_DIALOG_DATA);

  protected readonly isEdit = this.data.user !== null;
  protected readonly allRoles = Object.values(ROLES);

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.data.user?.firstName ?? '', [Validators.required, CustomValidators.notBlank()]],
    lastName: [this.data.user?.lastName ?? '', [Validators.required, CustomValidators.notBlank()]],
    email: [{ value: this.data.user?.email ?? '', disabled: this.isEdit }, [Validators.required, Validators.email]],
    password: ['', this.isEdit ? [] : [Validators.required, CustomValidators.strongPassword()]],
    roles: [this.data.user?.roles ?? [ROLES.customer], [Validators.required]],
    isActive: [this.data.user?.isActive ?? true],
  });

  toggleRole(role: string): void {
    const current = this.form.controls.roles.value;
    const next = current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
    this.form.controls.roles.setValue(next);
    this.form.controls.roles.markAsDirty();
  }

  isRoleSelected(role: string): boolean {
    return this.form.controls.roles.value.includes(role);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();

    if (this.isEdit && this.data.user) {
      this.store.dispatch(
        UserActions.updateUser({
          request: {
            id: this.data.user.id,
            firstName: value.firstName,
            lastName: value.lastName,
            roles: value.roles,
            isActive: value.isActive,
          },
        }),
      );
    } else {
      this.store.dispatch(
        UserActions.createUser({
          request: {
            email: value.email,
            firstName: value.firstName,
            lastName: value.lastName,
            password: value.password,
            roles: value.roles,
          },
        }),
      );
    }
    this.ref.close(true);
  }

  cancel(): void {
    this.ref.close(false);
  }
}
