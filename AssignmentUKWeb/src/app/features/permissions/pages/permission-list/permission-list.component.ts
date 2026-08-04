import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Permission } from '../../../../core/models/role.model';
import { PermissionService } from '../../services/permission.service';

/** Read-only catalogue of the application's permission keys, grouped by resource. */
@Component({
  selector: 'app-permission-list',
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Permissions" subtitle="The complete catalogue of access policies." />

    <div class="space-y-6">
      @for (group of grouped(); track group.name) {
        <div class="bg-surface-container-lowest rounded-2xl shadow-custom border border-outline-variant/10 p-6">
          <h3 class="font-bold text-brand-navy capitalize mb-4">{{ group.name }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (perm of group.items; track perm.key) {
              <div class="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
                <span class="material-symbols-outlined text-brand-orange">key</span>
                <div>
                  <p class="text-sm font-semibold text-brand-navy">{{ perm.name }}</p>
                  <code class="text-xs text-secondary">{{ perm.key }}</code>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class PermissionListComponent implements OnInit {
  private readonly permissionService = inject(PermissionService);

  private readonly permissions = signal<Permission[]>([]);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.permissionService.list().subscribe((permissions) => {
      this.permissions.set(permissions);
      this.loading.set(false);
    });
  }

  protected readonly grouped = computed(() => {
    const map = new Map<string, Permission[]>();
    this.permissions().forEach((p) => {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    });
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  });
}
