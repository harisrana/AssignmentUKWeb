import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MaskPipe } from '../../../../shared/pipes/mask.pipe';
import { User } from '../../../../core/models/user.model';

/**
 * User detail page. The `user` input is populated by `userResolver` via the
 * router's component-input binding (see provideRouter withComponentInputBinding).
 */
@Component({
  selector: 'app-user-detail',
  imports: [PageHeaderComponent, RouterLink, MaskPipe],
  template: `
    <app-page-header [title]="user()?.firstName + ' ' + user()?.lastName" subtitle="User details">
      <a routerLink="/app/users" class="text-primary font-bold hover:underline">← Back to users</a>
    </app-page-header>

    @if (user(); as u) {
      <div class="bg-surface-container-lowest rounded-2xl shadow-custom p-6 max-w-2xl">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <dt class="text-xs uppercase font-bold text-secondary/60">Email</dt>
            <dd class="text-brand-navy">{{ u.email | mask }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase font-bold text-secondary/60">Status</dt>
            <dd class="text-brand-navy">{{ u.isActive ? 'Active' : 'Inactive' }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase font-bold text-secondary/60">Roles</dt>
            <dd class="text-brand-navy">{{ u.roles.join(', ') }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase font-bold text-secondary/60">Permissions</dt>
            <dd class="text-brand-navy">{{ u.permissions.length }} granted</dd>
          </div>
        </dl>
      </div>
    } @else {
      <p class="text-secondary">User not found.</p>
    }
  `,
})
export class UserDetailComponent {
  readonly user = input<User | null>(null);
}
