import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Structural directive that renders its content only if the current user has
 * ALL of the given permissions.
 *
 *   <button *appHasPermission="['users.create']">New user</button>
 */
@Directive({ selector: '[appHasPermission]' })
export class HasPermissionDirective {
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private hasView = false;

  readonly appHasPermission = input.required<string[]>();

  constructor() {
    effect(() => {
      // Re-evaluate whenever permissions change (login/logout).
      this.auth.permissions();
      const allowed = this.auth.hasAllPermissions(this.appHasPermission());
      this.toggle(allowed);
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
