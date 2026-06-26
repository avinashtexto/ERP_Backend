import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

/* -------------------------------------------------------------------------- */
/*                               Cont Category                                */
/* -------------------------------------------------------------------------- */

export const contCategory = pgTable('cont_category', {
  pk_cat_id: integer('pk_cat_id').primaryKey().generatedByDefaultAsIdentity(),
  category: varchar('category', { length: 30 }).notNull().unique(),
  date_time_stamp: timestamp('date_time_stamp').notNull(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ContCategory = typeof contCategory.$inferSelect;
export type NewContCategory = typeof contCategory.$inferInsert;
