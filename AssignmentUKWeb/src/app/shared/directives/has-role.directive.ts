import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Structural directive that renders content only if the user has ANY of the
 * given roles.  <div *appHasRole="['Admin']">…</div>
 */
@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private hasView = false;

  readonly appHasRole = input.required<string[]>();

  constructor() {
    effect(() => {
      this.auth.roles();
      this.toggle(this.auth.hasAnyRole(this.appHasRole()));
    });
  }

  private toggle(show: boolean): void {
    if (show && !this.hasView) {
      this.vcr.createEmbeddedView(this.tpl);
      this.hasView = true;
    } else if (!show && this.hasView) {
      this.vcr.clear();
      this.hasView = false;
    }
  }
}
