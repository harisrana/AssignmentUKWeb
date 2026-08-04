import { Pipe, PipeTransform } from '@angular/core';

/**
 * Masks sensitive data (emails, phone numbers, card numbers), revealing only
 * the last `visible` characters. Used for displaying PII safely.
 *
 *   {{ user.email | mask }}          → j****@example.com
 *   {{ card | mask:4:'*' }}          → ************1234
 */
@Pipe({ name: 'mask' })
export class MaskPipe implements PipeTransform {
  transform(value: string | null | undefined, visible = 4, maskChar = '*'): string {
    if (!value) {
      return '';
    }

    // Special-case emails: mask the local part, keep the domain.
    const atIndex = value.indexOf('@');
    if (atIndex > 0) {
      const local = value.slice(0, atIndex);
      const domain = value.slice(atIndex);
      const shown = local.slice(0, 1);
      return `${shown}${maskChar.repeat(Math.max(1, local.length - 1))}${domain}`;
    }

    if (value.length <= visible) {
      return maskChar.repeat(value.length);
    }
    const hidden = maskChar.repeat(value.length - visible);
    return `${hidden}${value.slice(-visible)}`;
  }
}
