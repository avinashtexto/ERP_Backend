import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 8;

/**
 * Hashes a plaintext password string using Bcrypt safely.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim() === '') {
    throw new Error('Password payload cannot be empty');
  }
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Validates a plaintext password against an existing database string hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
