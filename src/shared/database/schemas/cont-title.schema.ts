import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

/* -------------------------------------------------------------------------- */
/*                                 Cont Title                                 */
/* -------------------------------------------------------------------------- */

export const contTitle = pgTable('cont_title', {
  pk_tit_id: integer('pk_tit_id').primaryKey().generatedByDefaultAsIdentity(),
  title: varchar('title', { length: 15 }).notNull().unique(),
  date_time_stamp: timestamp('date_time_stamp').notNull(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ContTitle = typeof contTitle.$inferSelect;
export type NewContTitle = typeof contTitle.$inferInsert;
