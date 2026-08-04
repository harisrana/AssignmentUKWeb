/** Standard envelope returned by the backend API. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | null;
  timestamp?: string;
}

/** Paginated result payload. */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

/** Query parameters for list/paged endpoints. */
export interface PageQuery {
  pageIndex: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
