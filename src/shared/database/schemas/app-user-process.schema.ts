import { relations } from 'drizzle-orm';
import { pgTable, varchar, bigint } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const appUserProcess = pgTable('app_user_process', {
  pk_pr_id: bigint('pk_pr_id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  fk_prod_id: varchar('fk_prod_id', { length: 10 }).notNull(),
  fk_user_id: bigint('fk_user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
});

export const appUserProcessRelations = relations(appUserProcess, ({ one }) => ({
  user: one(appUser, { fields: [appUserProcess.fk_user_id], references: [appUser.pk_user_id] }),
}));
