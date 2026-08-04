import { JwtPayload } from '../../core/models/auth.model';

/** Decode a JWT without verifying its signature (client-side only). */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Epoch (ms) when the token expires, or null if it cannot be determined. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwt(token);
  return payload?.exp ? payload.exp * 1000 : null;
}

/** True when the token is missing or its `exp` has passed (with optional skew). */
export function isTokenExpired(token: string | null, skewSeconds = 0): boolean {
  if (!token) {
    return true;
  }
  const expiry = getTokenExpiry(token);
  if (expiry === null) {
    return true;
  }
  return Date.now() >= expiry - skewSeconds * 1000;
}

/** Normalise a claim that may arrive as a string or string[]. */
export function claimToArray(claim: string[] | string | undefined): string[] {
  if (!claim) {
    return [];
  }
  return Array.isArray(claim) ? claim : [claim];
}
