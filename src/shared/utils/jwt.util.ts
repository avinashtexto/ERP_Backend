import jwt from 'jsonwebtoken';

// Explicit payload type conforming to lowercase database property naming rules
export interface AuthenticatedUserPayload extends jwt.JwtPayload {
  pk_user_id: number;
  username: string;
  sid?: number;
  fk_emp_id?: number | null;
}

/**
 * Generates a JWT access token.
 */
export function generateAccessToken(
  payload: Omit<AuthenticatedUserPayload, 'exp' | 'iat'>,
  expiresIn: string = process.env.JWT_ACCESS_EXPIRATION || '1d',
): string {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('MISSING_JWT_SECRET');
  }
  const tokenPayload = {
    ...payload,
    id: payload.pk_user_id,
  };
  return jwt.sign(tokenPayload, secret, { expiresIn });
}

/**
 * Generates a JWT refresh token.
 */
export function generateRefreshToken(
  payload: Omit<AuthenticatedUserPayload, 'exp' | 'iat'>,
  expiresIn: string = process.env.JWT_REFRESH_EXPIRATION || '7d',
): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('MISSING_JWT_REFRESH_SECRET');
  }
  const tokenPayload = {
    ...payload,
    id: payload.pk_user_id, // Backward compatibility fallback for 'id'
  };
  return jwt.sign(tokenPayload, secret, { expiresIn });
}

/**
 * Verifies an access token and returns the parsed payload.
 */
export function verifyAccessToken(token: string): AuthenticatedUserPayload {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('MISSING_JWT_SECRET');
  }

  const decoded = jwt.verify(token, secret) as any;

  // Enforce structural requirement checks against properties
  if (
    !decoded ||
    typeof decoded !== 'object' ||
    (!decoded.pk_user_id && !decoded.id) ||
    !decoded.username
  ) {
    throw new Error('INVALID_PAYLOAD_STRUCTURE');
  }

  return {
    ...decoded,
    pk_user_id: decoded.pk_user_id ?? decoded.id,
  } as AuthenticatedUserPayload;
}

/**
 * Verifies a refresh token and returns the parsed payload.
 */
export function verifyRefreshToken(token: string): AuthenticatedUserPayload {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error('MISSING_JWT_REFRESH_SECRET');
  }

  const decoded = jwt.verify(token, secret) as any;

  // Enforce structural requirement checks against properties
  if (
    !decoded ||
    typeof decoded !== 'object' ||
    (!decoded.pk_user_id && !decoded.id) ||
    !decoded.username
  ) {
    throw new Error('INVALID_PAYLOAD_STRUCTURE');
  }

  return {
    ...decoded,
    pk_user_id: decoded.pk_user_id ?? decoded.id,
  } as AuthenticatedUserPayload;
}
