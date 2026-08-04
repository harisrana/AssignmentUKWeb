import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration payload. `confirmPassword` is validated client-side only and is
 * never sent — the API contract is email/password/firstName/lastName.
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds. */
  expiresIn: number;
  tokenType?: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

/** Decoded JWT payload (RFC 7519 + custom claims). */
export interface JwtPayload {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  roles?: string[] | string;
  permissions?: string[] | string;
  exp: number;
  iat: number;
  [claim: string]: unknown;
}
