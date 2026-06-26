/**
 * skip-password-hash.types.ts
 * Type definitions for skip password hash module
 */

export interface SkipPasswordHashUser {
  id: number;
  username: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSkipPasswordHashUser {
  username: string;
}

export interface UpdateSkipPasswordHashUser {
  username?: string;
  is_active?: boolean;
}
