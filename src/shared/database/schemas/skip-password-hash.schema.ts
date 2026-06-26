/**
 * skip-password-hash.schema.ts
 * Schema for storing usernames that should skip password hashing
 */

import { pgTable, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const skipPasswordHash = pgTable('skip_password_hash', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
