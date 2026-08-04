import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Breadcrumb } from '../models/menu-item.model';

/**
 * Builds breadcrumb trails from the router tree using each route's
 * `data.breadcrumb` label. Exposed as a signal for zoneless-friendly binding.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly _breadcrumbs = signal<Breadcrumb[]>([]);
  readonly breadcrumbs = this._breadcrumbs.asReadonly();

  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this._breadcrumbs.set(this.build(this.router.routerState.snapshot.root));
      });
  }

  private build(route: ActivatedRouteSnapshot, url = '', acc: Breadcrumb[] = []): Breadcrumb[] {
    const child = route.firstChild;
    if (!child) {
      return acc;
    }
    const segment = child.url.map((s) => s.path).join('/');
    const nextUrl = segment ? `${url}/${segment}` : url;
    const label = child.data['breadcrumb'] as string | undefined;
    if (label) {
      acc.push({ label, url: nextUrl });
    }
    return this.build(child, nextUrl, acc);
  }
}
