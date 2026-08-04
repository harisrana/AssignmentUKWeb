import { describe, expect, it } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  const service = new ApiErrorService();

  it('prefers the server-provided message', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: 'Email already exists' } });
    expect(service.toUserMessage(error)).toBe('Email already exists');
  });

  it('joins server validation errors', () => {
    const error = new HttpErrorResponse({ status: 422, error: { errors: ['A required', 'B invalid'] } });
    expect(service.toUserMessage(error)).toBe('A required B invalid');
  });

  it('maps known status codes without a body', () => {
    expect(service.toUserMessage(new HttpErrorResponse({ status: 403 }))).toContain('permission');
    expect(service.toUserMessage(new HttpErrorResponse({ status: 404 }))).toContain('not found');
    expect(service.toUserMessage(new HttpErrorResponse({ status: 500 }))).toContain('server error');
  });
});
