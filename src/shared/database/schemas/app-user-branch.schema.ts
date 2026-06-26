import { relations } from 'drizzle-orm';
import { pgTable, bigint } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const appUserBranch = pgTable('app_user_branch', {
  pk_br_id: bigint('pk_br_id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  fk_user_id: bigint('fk_user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
  fk_set_id: bigint('fk_set_id', { mode: 'number' }).notNull(),
});

export const appUserBranchRelations = relations(appUserBranch, ({ one }) => ({
  user: one(appUser, { fields: [appUserBranch.fk_user_id], references: [appUser.pk_user_id] }),
}));
