import { relations } from 'drizzle-orm';
import { pgTable, varchar, boolean, timestamp, bigint } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';
import { newId } from './new-id.schema.js';

export const appUserOther = pgTable('app_user_other', {
  pk_oth_id: bigint('pk_oth_id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  form: varchar('form', { length: 100 })
    .notNull()
    .references(() => newId.form_name),
  user_id: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
  rights: boolean('rights'),
  date_time_stamp: timestamp('date_time_stamp', { mode: 'date' }).notNull().defaultNow(),
  fk_user_id: bigint('fk_user_id', { mode: 'number' })
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull().default(''),
});

export const appUserOtherRelations = relations(appUserOther, ({ one }) => ({
  user: one(appUser, { fields: [appUserOther.user_id], references: [appUser.pk_user_id] }),
}));
