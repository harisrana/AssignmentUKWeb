import { Component, ElementRef, ViewChild, inject, input, output, signal } from '@angular/core';
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
            <span class="flex items-center gap-2 text-brand-navy min-w-0">
              <span class="material-symbols-outlined text-base shrink-0">description</span>
              <span class="truncate">{{ file.name }}</span>
            </span>
            <span class="flex items-center gap-2 shrink-0">
              <span class="text-secondary">{{ (file.size / 1024).toFixed(0) }} KB</span>
              <button
                type="button"
                (click)="removeFile(file, $event)"
                class="p-1 rounded-full text-secondary hover:text-error hover:bg-error/10"
                [attr.aria-label]="'Remove ' + file.name"
                title="Remove"
              >
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </span>
          </li>
        }
      </ul>
    }
  `,
})
export class FileUploadComponent {
  private readonly notify = inject(NotificationService);

  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;

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

  reset(): void {
    this.files.set([]);
    if (this.inputRef) {
      this.inputRef.nativeElement.value = '';
    }
  }

  removeFile(file: File, event: Event): void {
    event.stopPropagation();
    const next = this.files().filter((f) => f !== file);
    this.files.set(next);
    this.filesSelected.emit(next);
    if (next.length === 0 && this.inputRef) {
      // Clear the native input too, so re-selecting the same file still fires a change event.
      this.inputRef.nativeElement.value = '';
    }
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
