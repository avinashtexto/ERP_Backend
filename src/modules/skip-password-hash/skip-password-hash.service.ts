/**
 * skip-password-hash.service.ts
 * Database transaction logic for skip password hash module
 */

import { eq } from 'drizzle-orm';

import { db } from '../../config/db.config.js';
import { skipPasswordHash } from '../../shared/database/schemas/skip-password-hash.schema.js';
import { clearSkipPasswordHashCache } from '../../shared/utils/password.util.js';

import type {
  CreateSkipPasswordHashUser,
  SkipPasswordHashUser,
  UpdateSkipPasswordHashUser,
} from './skip-password-hash.types.js';

export async function getAllSkipPasswordHashUsers(): Promise<SkipPasswordHashUser[]> {
  return await db.select().from(skipPasswordHash).orderBy(skipPasswordHash.username);
}

export async function getSkipPasswordHashUserById(id: number): Promise<SkipPasswordHashUser | null> {
  const results = await db.select().from(skipPasswordHash).where(eq(skipPasswordHash.id, id)).limit(1);
  return results[0] || null;
}

export async function getSkipPasswordHashUserByUsername(username: string): Promise<SkipPasswordHashUser | null> {
  const results = await db.select().from(skipPasswordHash).where(eq(skipPasswordHash.username, username)).limit(1);
  return results[0] || null;
}

export async function createSkipPasswordHashUser(
  data: CreateSkipPasswordHashUser,
): Promise<SkipPasswordHashUser> {
  const result = await db
    .insert(skipPasswordHash)
    .values({
      username: data.username,
      is_active: true,
    })
    .returning();

  // Clear cache after creating new user
  clearSkipPasswordHashCache();

  const newUser = result[0];
  if (!newUser) {
    throw new Error('Failed to create user');
  }
  return newUser;
}

export async function updateSkipPasswordHashUser(
  id: number,
  data: UpdateSkipPasswordHashUser,
): Promise<SkipPasswordHashUser | null> {
  const updateData: any = {
    updated_at: new Date(),
  };

  if (data.username !== undefined) {
    updateData.username = data.username;
  }
  if (data.is_active !== undefined) {
    updateData.is_active = data.is_active;
  }

  const result = await db
    .update(skipPasswordHash)
    .set(updateData)
    .where(eq(skipPasswordHash.id, id))
    .returning();

  // Clear cache after updating user
  clearSkipPasswordHashCache();

  return result[0] || null;
}

export async function deleteSkipPasswordHashUser(id: number): Promise<boolean> {
  const result = await db.delete(skipPasswordHash).where(eq(skipPasswordHash.id, id)).returning({ id: skipPasswordHash.id });

  // Clear cache after deleting user
  clearSkipPasswordHashCache();

  return result.length > 0;
}
