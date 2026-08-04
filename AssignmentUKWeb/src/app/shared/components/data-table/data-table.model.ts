export interface TableColumn<T> {
  key: string;
  header: string;
  /** Custom cell renderer returning display text. */
  cell?: (row: T) => string;
  /** Show a coloured status chip for this column. */
  type?: 'text' | 'chip' | 'date';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T> {
  icon: string;
  label: string;
  color?: 'primary' | 'warn' | 'default';
  /** Optionally hide the action for specific rows. */
  visible?: (row: T) => boolean;
}

export interface PageChange {
  pageIndex: number;
  pageSize: number;
}
