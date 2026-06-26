import { relations } from 'drizzle-orm';
import { pgTable, numeric, bigint } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const appUserDashboard = pgTable('app_user_dashboard', {
  pk_db_id: bigint('pk_db_id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  fk_user_id: bigint('fk_user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
  id: numeric('id', { precision: 18, scale: 0 }).notNull(),
});

export const appUserDashboardRelations = relations(appUserDashboard, ({ one }) => ({
  user: one(appUser, { fields: [appUserDashboard.fk_user_id], references: [appUser.pk_user_id] }),
}));
