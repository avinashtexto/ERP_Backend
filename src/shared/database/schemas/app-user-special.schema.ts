import { relations } from 'drizzle-orm';
import { pgTable, varchar, boolean, bigint } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const appUserSpecial = pgTable('app_user_special', {
  pk_spe_id: bigint('pk_spe_id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  form: varchar('form', { length: 75 }).notNull(),
  user_id: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
  rights: boolean('rights').notNull().default(false),
});

export const appUserSpecialRelations = relations(appUserSpecial, ({ one }) => ({
  user: one(appUser, { fields: [appUserSpecial.user_id], references: [appUser.pk_user_id] }),
}));
