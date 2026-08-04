import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

type ParamValue = string | number | boolean | null | undefined;

/**
 * Base class for all API services. Centralises HttpClient usage, param
 * building, and unwrapping of the standard `ApiResponse<T>` envelope so feature
 * services stay small and consistent (DRY / SRP).
 */
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);

  protected get<T>(url: string, params?: Record<string, ParamValue>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(url, { params: this.buildParams(params) })
      .pipe(map((res) => res.data));
  }

  protected post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(url, body).pipe(map((res) => res.data));
  }

  protected put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(url, body).pipe(map((res) => res.data));
  }

  protected patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(url, body).pipe(map((res) => res.data));
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(url).pipe(map((res) => res.data));
  }

  /** Raw request that returns the full envelope (for pagination metadata etc.). */
  protected getRaw<T>(url: string, params?: Record<string, ParamValue>): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, { params: this.buildParams(params) });
  }

  private buildParams(params?: Record<string, ParamValue>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
