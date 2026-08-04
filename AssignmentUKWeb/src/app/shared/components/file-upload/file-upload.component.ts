import { Component, inject, input, output, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

/** Drag-and-drop / click file upload with client-side size + type validation. */
@Component({
  selector: 'app-file-upload',
  template: `
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
      [class.border-brand-orange]="dragging()"
      [class.bg-brand-orange]="false"
      [class.border-outline-variant]="!dragging()"
      (dragover)="onDragOver($event)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
      (click)="input.click()"
    >
      <span class="material-symbols-outlined text-4xl text-brand-orange">cloud_upload</span>
      <p class="mt-2 font-semibold text-brand-navy">Drag & drop files here, or click to browse</p>
      <p class="text-xs text-secondary mt-1">
        Accepted: {{ accept() }} · Max {{ maxSizeMb() }}MB
      </p>
      <input
        #input
        type="file"
        hidden
        [accept]="accept()"
        [multiple]="multiple()"
        (change)="onSelect($event)"
      />
    </div>

    @if (files().length) {
      <ul class="mt-4 space-y-2">
        @for (file of files(); track file.name) {
          <li class="flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2 text-sm">
            <span class="flex items-center gap-2 text-brand-navy">
              <span class="material-symbols-outlined text-base">description</span>
              {{ file.name }}
            </span>
            <span class="text-secondary">{{ (file.size / 1024).toFixed(0) }} KB</span>
          </li>
        }
      </ul>
    }
  `,
})
export class FileUploadComponent {
  private readonly notify = inject(NotificationService);

  readonly accept = input(APP_CONSTANTS.acceptedUploadTypes.join(','));
  readonly maxSizeMb = input(APP_CONSTANTS.maxUploadSizeMb);
  readonly multiple = input(true);
  readonly filesSelected = output<File[]>();

  protected readonly dragging = signal(false);
  protected readonly files = signal<File[]>([]);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.handle(event.dataTransfer?.files);
  }

  onSelect(event: Event): void {
    this.handle((event.target as HTMLInputElement).files);
  }

  private handle(list: FileList | null | undefined): void {
    if (!list) {
      return;
    }
    const accepted: File[] = [];
    Array.from(list).forEach((file) => {
      if (file.size > this.maxSizeMb() * 1024 * 1024) {
        this.notify.error(`${file.name} exceeds the ${this.maxSizeMb()}MB limit.`);
        return;
      }
      accepted.push(file);
    });
    const next = this.multiple() ? [...this.files(), ...accepted] : accepted.slice(0, 1);
    this.files.set(next);
    this.filesSelected.emit(next);
  }
}
