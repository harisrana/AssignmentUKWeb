export interface MenuItem {
  label: string;
  /** Material Symbols icon name. */
  icon?: string;
  route?: string;
  /** Show item only if the user has ALL these permissions. */
  permissions?: string[];
  /** Show item only if the user has ANY of these roles. */
  roles?: string[];
  children?: MenuItem[];
  badge?: string | number;
  divider?: boolean;
}

export interface Breadcrumb {
  label: string;
  url: string;
}
