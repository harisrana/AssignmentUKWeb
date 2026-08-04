import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { ValidationSummaryComponent } from '../../../../shared/components/validation-summary/validation-summary.component';
import { CustomValidators } from '../../../../shared/validators/custom-validators';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProfileService } from '../../../../core/services/profile.service';

/**
 * Profile page with a reactive form. Implements CanComponentDeactivate so the
 * unsaved-changes guard can warn before navigating away with a dirty form.
 */
@Component({
  selector: 'app-profile-page',
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    FileUploadComponent,
    ValidationSummaryComponent,
  ],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent implements CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly profile = inject(ProfileService);

  private readonly user = this.auth.user();
  private readonly selectedAvatarFile = signal<File | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.user?.firstName ?? '', [Validators.required]],
    lastName: [this.user?.lastName ?? '', [Validators.required]],
    email: [{ value: this.user?.email ?? '', disabled: true }],
    phoneNumber: [this.user?.phoneNumber ?? '', [CustomValidators.ukPhone()]],
    bio: [this.user?.bio ?? ''],
  });

  protected readonly canSave = computed(() => this.form.dirty || this.selectedAvatarFile() !== null);

  onAvatarSelected(files: File[]): void {
    if (files.length) {
      this.selectedAvatarFile.set(files[0]);
      this.notify.info(`Selected ${files[0].name} — it will upload when you save.`);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, phoneNumber, bio } = this.form.getRawValue();
    const avatarFile = this.selectedAvatarFile();

    this.profile
      .updateProfile({ firstName, lastName, phoneNumber, bio })
      .pipe(switchMap((user) => (avatarFile ? this.profile.uploadAvatar(avatarFile) : of(user))))
      .subscribe((user) => {
        this.auth.setUser(user);
        this.form.markAsPristine();
        this.selectedAvatarFile.set(null);
        this.notify.success('Profile updated successfully.');
      });
  }

  canDeactivate(): boolean {
    return !this.form.dirty && this.selectedAvatarFile() === null;
  }
}
