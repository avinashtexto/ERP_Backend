/**
 * password.util.ts
 * Utility functions for password handling
 */

import { db } from '../../config/db.config.js';
import { skipPasswordHash } from '../database/schemas/skip-password-hash.schema.js';
import { eq } from 'drizzle-orm';

// Cache for skip password hash usernames
let cachedSkipUsers: Set<string> | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch usernames that should skip password hashing from database
 * @returns Set of usernames (lowercase)
 */
async function fetchSkipPasswordHashUsers(): Promise<Set<string>> {
  const now = Date.now();
  
  // Return cached result if still valid
  if (cachedSkipUsers && cacheExpiry > now) {
    return cachedSkipUsers;
  }
  
  // Fetch from database
  const results = await db
    .select({ username: skipPasswordHash.username })
    .from(skipPasswordHash)
    .where(eq(skipPasswordHash.is_active, true));
  
  const usernames = new Set(results.map((r: { username: string }) => r.username.toLowerCase()));
  
  // Update cache
  cachedSkipUsers = usernames;
  cacheExpiry = now + CACHE_TTL_MS;
  
  return usernames;
}

/**
 * Check if a username should skip password hashing
 * Users are fetched from database (skip_password_hash table)
 * @param username - The username to check
 * @returns true if password hashing should be skipped for this user
 */
export async function shouldSkipPasswordHash(username?: string): Promise<boolean> {
  if (!username) return false;
  
  const skipUsers = await fetchSkipPasswordHashUsers();
  return skipUsers.has(username.toLowerCase());
}

/**
 * Clear the cache for skip password hash users
 * Call this after modifying the database
 */
export function clearSkipPasswordHashCache(): void {
  cachedSkipUsers = null;
  cacheExpiry = 0;
}
