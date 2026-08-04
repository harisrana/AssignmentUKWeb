import { Component, OnInit, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Role } from '../../../../core/models/role.model';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-list',
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Roles" subtitle="Define roles and the permissions they grant." />

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      @for (role of roles(); track role.id) {
        <div class="bg-surface-container-lowest rounded-2xl shadow-custom border border-outline-variant/10 p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-lg text-brand-navy">{{ role.name }}</h3>
            @if (role.isSystem) {
              <span class="text-xs px-2 py-0.5 rounded-full bg-secondary-container/40 text-brand-navy font-bold">System</span>
            }
          </div>
          <p class="text-sm text-secondary mb-4">{{ role.description }}</p>
          <div class="flex flex-wrap gap-1.5">
            @for (perm of role.permissions; track perm) {
              <span class="text-xs px-2 py-1 rounded-full bg-surface-container-low text-secondary">{{ perm }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class RoleListComponent implements OnInit {
  private readonly roleService = inject(RoleService);

  protected readonly roles = signal<Role[]>([]);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.roleService.list().subscribe((roles) => {
      this.roles.set(roles);
      this.loading.set(false);
    });
  }
}
