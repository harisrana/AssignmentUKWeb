import { describe, expect, it } from 'vitest';
import { claimToArray, decodeJwt, isTokenExpired } from './jwt.util';

/** Build an unsigned JWT with the given payload (test helper). */
function makeToken(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'none' })}.${b64(payload)}.`;
}

describe('jwt.util', () => {
  it('decodes a valid JWT payload', () => {
    const token = makeToken({ sub: '123', email: 'a@b.com', exp: 1000 });
    const decoded = decodeJwt(token);
    expect(decoded?.sub).toBe('123');
    expect(decoded?.email).toBe('a@b.com');
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
  });

  it('flags an expired token', () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    expect(isTokenExpired(makeToken({ exp: past }))).toBe(true);
  });

  it('treats a future token as valid', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired(makeToken({ exp: future }))).toBe(false);
  });

  it('treats null token as expired', () => {
    expect(isTokenExpired(null)).toBe(true);
  });

  it('normalises string and array claims', () => {
    expect(claimToArray('Admin')).toEqual(['Admin']);
    expect(claimToArray(['Admin', 'Manager'])).toEqual(['Admin', 'Manager']);
    expect(claimToArray(undefined)).toEqual([]);
  });
});
