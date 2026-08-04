import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Sanitises an HTML string via Angular's DomSanitizer before binding with
 * [innerHTML]. Angular strips dangerous markup, mitigating XSS. Only use for
 * trusted-but-dynamic content (e.g. CMS copy).
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.sanitize(1 /* SecurityContext.HTML */, value ?? '') ?? '';
  }
}
