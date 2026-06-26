import { relations } from 'drizzle-orm';
import { pgTable, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const userSessions = pgTable('user_sessions', {
  session_id: integer('session_id').primaryKey().generatedByDefaultAsIdentity(),
  user_id: integer('user_id')
    .notNull()
    .references(() => appUser.pk_user_id, { onDelete: 'cascade' }),
  refresh_token: text('refresh_token').notNull(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  expires_at: timestamp('expires_at', { mode: 'date' }).notNull(),
});

export const adminSessions = pgTable('admin_sessions', {
  session_id: integer('session_id').primaryKey().generatedByDefaultAsIdentity(),
  admin_user_id: integer('admin_user_id')
    .notNull()
    .references(() => appUser.pk_user_id, { onDelete: 'cascade' }),
  refresh_token: varchar('refresh_token', { length: 500 }).notNull(),
  deviceInfo: varchar('device_info', { length: 500 }),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  expires_at: timestamp('expires_at', { mode: 'date' }).notNull(),
});

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(appUser, {
    fields: [userSessions.user_id],
    references: [appUser.pk_user_id],
  }),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(appUser, {
    fields: [adminSessions.admin_user_id],
    references: [appUser.pk_user_id],
  }),
}));
