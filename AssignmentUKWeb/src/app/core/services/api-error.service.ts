import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

/** Maps raw HttpErrorResponse objects to user-friendly messages. */
@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  toUserMessage(error: HttpErrorResponse): string {
    // Client / network error.
    if (error.error instanceof ErrorEvent) {
      return 'A network error occurred. Please check your connection and try again.';
    }

    // Server returned a standard envelope with a message.
    const serverMessage = this.extractServerMessage(error);
    if (serverMessage) {
      return serverMessage;
    }

    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Please try again shortly.';
      case 400:
        return 'The request was invalid. Please review your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with the current state of the resource.';
      case 422:
        return 'Validation failed. Please correct the highlighted fields.';
      case 429:
        return 'Too many requests. Please slow down and try again.';
      case 500:
        return 'An internal server error occurred. Our team has been notified.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    const body = error.error as { message?: string; errors?: string[] } | string | null;
    if (!body) {
      return null;
    }
    if (typeof body === 'string') {
      return body;
    }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      return body.errors.join(' ');
    }
    return body.message ?? null;
  }
}
